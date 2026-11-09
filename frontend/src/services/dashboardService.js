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

  // Filtra produtos ativos de forma segura
  const ativos = produtos.filter((p) => p.ativo !== false);

  // Mapeia de forma segura para suportar tanto mock (saldoAtual) quanto Spring Boot (quantidadeEstoque)
  const getQuantidade = (p) => Number(p.saldoAtual ?? p.quantidadeEstoque ?? 0);
  const getEstoqueMinimo = (p) => Number(p.estoqueMinimo ?? p.quantidadeMinima ?? 0);
  const getCategoriaId = (p) => p.categoriaId ?? p.categoria?.id;

  const totalEstocado = ativos.reduce((s, p) => s + getQuantidade(p), 0);
  const valorInvestido = ativos.reduce((s, p) => s + getQuantidade(p) * Number(p.preco ?? 0), 0);
  
  const criticos = ativos.filter((p) => isEstoqueCritico(getQuantidade(p), getEstoqueMinimo(p)));
  
  // Considera status de pedidos pendentes conforme o enum do Spring Boot (SOLICITADO ou RASCUNHO)
  const pedidosPendentes = pedidos.filter(
    (p) => p.status === 'SOLICITADO' || p.status === 'RASCUNHO' || p.status === 'PENDENTE'
  ).length;

  // Estoque agregado por categoria (grafico de barras).
  const estoquePorCategoria = categorias.map((cat) => ({
    categoria: cat.nome,
    quantidade: ativos
      .filter((p) => getCategoriaId(p) === cat.id)
      .reduce((s, p) => s + getQuantidade(p), 0),
  }));

  // Movimentacoes agregadas por dia (grafico de linha/area).
  const porDia = {};
  movimentacoes.forEach((m) => {
    const dataMov = m.data || m.dataMovimentacao || '';
    const dia = String(dataMov).slice(0, 10);
    if (!dia) return;

    if (!porDia[dia]) porDia[dia] = { dia, entradas: 0, saidas: 0 };
    
    const tipo = m.tipo || m.tipoMovimentacao;
    const qtd = Number(m.quantidade || 0);

    if (tipo === 'ENTRADA') porDia[dia].entradas += qtd;
    else porDia[dia].saidas += qtd;
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