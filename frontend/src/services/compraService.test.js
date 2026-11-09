import {
  listarPedidos,
  criarPedido,
  atualizarStatus,
  calcularTotal,
  STATUS_PEDIDO,
} from './compraService.js';
import api from './api.js';

// Mock do cliente Axios centralizado
jest.mock('./api.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

describe('calcularTotal (Função Pura)', () => {
  it('soma quantidade x preco de cada item', () => {
    const total = calcularTotal([
      { quantidade: 2, precoUnitario: 10 },
      { quantidade: 3, precoUnitario: 5 },
    ]);
    expect(total).toBe(35);
  });

  it('retorna zero para lista vazia ou indefinida', () => {
    expect(calcularTotal([])).toBe(0);
    expect(calcularTotal(undefined)).toBe(0);
  });
});

describe('compraService (com Axios Mockado)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lista pedidos da API', async () => {
    const mockPedidos = [
      {
        id: 1,
        fornecedorId: 2,
        fornecedorNome: 'EletroSul',
        status: 'SOLICITADO',
        itens: [{ produtoId: 7, quantidade: 2, precoUnitario: 10 }],
      },
    ];
    api.get.mockResolvedValueOnce({ data: mockPedidos });

    const pedidos = await listarPedidos();
    expect(api.get).toHaveBeenCalledWith('/compras');
    expect(pedidos.length).toBeGreaterThan(0);
  });

  it('cria um pedido de compra', async () => {
    const dadosPedido = {
      fornecedorId: 2,
      fornecedorNome: 'EletroSul',
      itens: [{ produtoId: 7, produtoNome: 'Fita', quantidade: 10, precoUnitario: 6.9 }],
    };
    const mockResposta = { id: 1, ...dadosPedido, status: 'SOLICITADO' };
    api.post.mockResolvedValueOnce({ data: mockResposta });

    const pedido = await criarPedido(dadosPedido);
    expect(api.post).toHaveBeenCalledWith('/compras', dadosPedido);
    expect(pedido.status).toBe('SOLICITADO');
  });

  it('atualiza o status de um pedido', async () => {
    const mockAtualizado = { id: 1, status: 'ENTREGUE' };
    api.patch.mockResolvedValueOnce({ data: mockAtualizado });

    const resultado = await atualizarStatus(1, 'ENTREGUE');
    expect(api.patch).toHaveBeenCalledWith(
      '/compras/1/status',
      { status: 'ENTREGUE' },
      expect.any(Object) // Valida que os headers (X-Usuario-Id) foram passados
    );
    expect(resultado.status).toBe('ENTREGUE');
  });

  it('expoe a lista de status possiveis do enum do Spring Boot', () => {
    expect(STATUS_PEDIDO).toContain('ENTREGUE');
    expect(STATUS_PEDIDO).toContain('RASCUNHO');
    expect(STATUS_PEDIDO).toContain('SOLICITADO');
  });
});