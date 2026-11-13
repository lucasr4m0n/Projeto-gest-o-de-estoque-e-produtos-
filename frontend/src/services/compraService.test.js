import {
  listarPedidos,
  criarPedido,
  atualizarStatus,
  calcularTotal,
  STATUS_PEDIDO,
} from './compraService.js';
import api from './api.js';

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
  it('lista pedidos e traduz dataPedido para data', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          fornecedorId: 2,
          fornecedorNome: 'EletroSul',
          status: 'SOLICITADO',
          dataPedido: '2026-11-01T10:00:00-03:00',
          itens: [{ id: 1, produtoId: 7, produtoNome: 'Fita', quantidade: 2, precoUnitario: 10 }],
          total: 20,
        },
      ],
    });

    const pedidos = await listarPedidos();

    expect(api.get).toHaveBeenCalledWith('/compras');
    expect(pedidos[0].data).toBe('2026-11-01T10:00:00-03:00');
    expect(pedidos[0].fornecedorNome).toBe('EletroSul');
  });

  it('cria um pedido enviando apenas os campos da API', async () => {
    const dadosPedido = {
      fornecedorId: '2',
      fornecedorNome: 'EletroSul',
      itens: [{ produtoId: 7, produtoNome: 'Fita', quantidade: 10, precoUnitario: 6.9 }],
    };
    api.post.mockResolvedValueOnce({ data: { id: 1, status: 'RASCUNHO' } });

    const pedido = await criarPedido(dadosPedido);

    expect(api.post).toHaveBeenCalledWith('/compras', {
      fornecedorId: 2,
      itens: [{ produtoId: 7, quantidade: 10, precoUnitario: 6.9 }],
    });
    expect(pedido.status).toBe('RASCUNHO');
  });

  it('atualiza o status de um pedido', async () => {
    api.patch.mockResolvedValueOnce({ data: { id: 1, status: 'ENTREGUE' } });

    const resultado = await atualizarStatus(1, 'ENTREGUE');

    expect(api.patch).toHaveBeenCalledWith(
      '/compras/1/status',
      { status: 'ENTREGUE' },
      expect.any(Object),
    );
    expect(resultado.status).toBe('ENTREGUE');
  });

  it('expoe a lista de status possiveis do enum do Spring Boot', () => {
    expect(STATUS_PEDIDO).toContain('ENTREGUE');
    expect(STATUS_PEDIDO).toContain('RASCUNHO');
    expect(STATUS_PEDIDO).toContain('SOLICITADO');
  });
});