import {
  listarPedidos,
  criarPedido,
  atualizarStatus,
  calcularTotal,
  STATUS_PEDIDO,
} from './compraService.js';
import { obterProduto } from './produtoService.js';

describe('calcularTotal', () => {
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

describe('compraService', () => {
  it('lista pedidos com total calculado', async () => {
    const pedidos = await listarPedidos();
    expect(pedidos.length).toBeGreaterThan(0);
    expect(pedidos[0]).toHaveProperty('total');
  });

  it('cria um pedido com status PENDENTE', async () => {
    const pedido = await criarPedido({
      fornecedorId: 2,
      fornecedorNome: 'EletroSul',
      itens: [{ produtoId: 7, produtoNome: 'Fita', quantidade: 10, precoUnitario: 6.9 }],
    });
    expect(pedido.status).toBe('PENDENTE');
    expect(pedido.total).toBeCloseTo(69);
  });

  it('rejeita pedido sem itens', async () => {
    await expect(criarPedido({ fornecedorId: 2, itens: [] })).rejects.toThrow(/ao menos um item/i);
  });

  it('credita o estoque ao marcar como ENTREGUE', async () => {
    const pedido = await criarPedido({
      fornecedorId: 2,
      fornecedorNome: 'EletroSul',
      itens: [{ produtoId: 7, produtoNome: 'Fita', quantidade: 4, precoUnitario: 6.9 }],
    });
    const antes = await obterProduto(7);
    await atualizarStatus(pedido.id, 'ENTREGUE');
    const depois = await obterProduto(7);
    expect(depois.saldoAtual).toBe(antes.saldoAtual + 4);
  });

  it('rejeita status invalido', async () => {
    const pedidos = await listarPedidos();
    await expect(atualizarStatus(pedidos[0].id, 'XPTO')).rejects.toThrow(/invalido/i);
  });

  it('rejeita atualizacao de pedido inexistente', async () => {
    await expect(atualizarStatus(999999, 'APROVADO')).rejects.toThrow(/nao encontrado/i);
  });

  it('expoe a lista de status possiveis', () => {
    expect(STATUS_PEDIDO).toContain('ENTREGUE');
  });
});
