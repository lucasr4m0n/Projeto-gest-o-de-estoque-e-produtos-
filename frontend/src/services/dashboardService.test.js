import { obterIndicadores } from './dashboardService.js';
import { listarProdutos } from './produtoService.js';
import { listarCategorias } from './categoriaService.js';
import { listarPedidos } from './compraService.js';
import { listarMovimentacoes } from './movimentacaoService.js';

// Mock dos serviços para isolar a lógica do Dashboard
jest.mock('./produtoService.js');
jest.mock('./categoriaService.js');
jest.mock('./compraService.js');
jest.mock('./movimentacaoService.js');

describe('dashboardService (com Serviços Mockados)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('consolida os indicadores do painel corretamente', async () => {
    // Configura os retornos simulados para cada serviço
    listarProdutos.mockResolvedValue([
      { id: 1, nome: 'Cabo Flexivel', preco: 10.0, saldoAtual: 2, estoqueMinimo: 5, categoriaId: 1, ativo: true },
      { id: 2, nome: 'Disjuntor', preco: 50.0, saldoAtual: 20, estoqueMinimo: 2, categoriaId: 2, ativo: true },
    ]);

    listarCategorias.mockResolvedValue([
      { id: 1, nome: 'Elétrica' },
      { id: 2, nome: 'Segurança' },
    ]);

    listarPedidos.mockResolvedValue([
      { id: 1, status: 'SOLICITADO' },
    ]);

    listarMovimentacoes.mockResolvedValue([
      { id: 1, tipo: 'ENTRADA', quantidade: 10, data: '2026-10-01T10:00:00Z' },
    ]);

    const dados = await obterIndicadores();

    // Valida a estrutura dos cards
    expect(dados.cards).toHaveProperty('totalEstocado');
    expect(dados.cards).toHaveProperty('valorInvestido');
    expect(dados.cards).toHaveProperty('produtosCriticos');
    expect(dados.cards).toHaveProperty('pedidosPendentes');

    // Valida se os arrays retornados são válidos
    expect(Array.isArray(dados.criticos)).toBe(true);
    expect(Array.isArray(dados.estoquePorCategoria)).toBe(true);
    expect(Array.isArray(dados.movimentacaoPorDia)).toBe(true);

    // Valida regras de negócio consolidadas
    expect(dados.cards.produtosCriticos).toBeGreaterThan(0); // O 'Cabo Flexivel' está crítico (saldo 2 < min 5)
    expect(dados.cards.totalEstocado).toBe(22); // 2 + 20
    expect(dados.cards.pedidosPendentes).toBe(1); // Pedido com status SOLICITADO
  });
});