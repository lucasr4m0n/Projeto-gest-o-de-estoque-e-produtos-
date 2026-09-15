import { listarProdutos } from './produtoService.js';
import { listarCategorias } from './categoriaService.js';
import { listarPedidos } from './compraService.js';
import { listarMovimentacoes } from './movimentacaoService.js';
import { isEstoqueCritico } from '../utils/formatters.js';

/** Consolida os indicadores exibidos no Dashboard (RF-F06). */
export async function obterIndicadores() {
  const [produtos, categorias, pedidos, movimentacoes] = await Promise.all([
    listarProdutos(),
    listarCategorias(),
    listarPedidos(),
    listarMovimentacoes(),
  ]);

  const ativos = produtos.filter((p) => p.ativo !== false);
  const totalEstocado = ativos.reduce((s, p) => s + Number(p.saldoAtual), 0);
  const valorInvestido = ativos.reduce((s, p) => s + Number(p.saldoAtual) * Number(p.preco), 0);
  const criticos = ativos.filter((p) => isEstoqueCritico(p.saldoAtual, p.estoqueMinimo));
  const pedidosPendentes = pedidos.filter((p) => p.status === 'PENDENTE').length;

  // Estoque agregado por categoria (grafico de barras).
  const estoquePorCategoria = categorias.map((cat) => ({
    categoria: cat.nome,
    quantidade: ativos
      .filter((p) => p.categoriaId === cat.id)
      .reduce((s, p) => s + Number(p.saldoAtual), 0),
  }));

  // Movimentacoes agregadas por dia (grafico de linha/area).
  const porDia = {};
  movimentacoes.forEach((m) => {
    const dia = String(m.data).slice(0, 10);
    if (!porDia[dia]) porDia[dia] = { dia, entradas: 0, saidas: 0 };
    if (m.tipo === 'ENTRADA') porDia[dia].entradas += Number(m.quantidade);
    else porDia[dia].saidas += Number(m.quantidade);
  });
  const movimentacaoPorDia = Object.values(porDia).sort((a, b) => a.dia.localeCompare(b.dia));

  return {
    cards: {
      totalEstocado,
      valorInvestido,
      produtosCriticos: criticos.length,
      pedidosPendentes,
    },
    criticos,
    estoquePorCategoria,
    movimentacaoPorDia,
  };
}
