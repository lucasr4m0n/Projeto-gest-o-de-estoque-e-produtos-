import pedidosMock from '../mocks/pedidosMock.json';
import { mockResponse, mockError } from './mockAdapter.js';
import { ajustarSaldoLocal } from './produtoService.js';

let pedidos = JSON.parse(JSON.stringify(pedidosMock));
let nextId = Math.max(...pedidos.map((p) => p.id), 1000) + 1;

export const STATUS_PEDIDO = ['PENDENTE', 'APROVADO', 'ENTREGUE', 'CANCELADO'];

export function calcularTotal(itens) {
  return (itens || []).reduce(
    (soma, item) => soma + Number(item.quantidade) * Number(item.precoUnitario),
    0,
  );
}

export async function listarPedidos() {
  const comTotal = pedidos.map((p) => ({ ...p, total: calcularTotal(p.itens) }));
  return mockResponse(comTotal);
}

export async function criarPedido(dados) {
  if (!dados.itens || dados.itens.length === 0) {
    return mockError('O pedido deve conter ao menos um item.', 422);
  }
  const novo = {
    id: nextId,
    fornecedorId: Number(dados.fornecedorId),
    fornecedorNome: dados.fornecedorNome,
    status: 'PENDENTE',
    data: new Date().toISOString(),
    itens: dados.itens.map((i) => ({
      produtoId: Number(i.produtoId),
      produtoNome: i.produtoNome,
      quantidade: Number(i.quantidade),
      precoUnitario: Number(i.precoUnitario),
    })),
  };
  nextId += 1;
  pedidos = [...pedidos, novo];
  return mockResponse({ ...novo, total: calcularTotal(novo.itens) });
}

/**
 * Atualiza o status do pedido. Ao marcar como ENTREGUE, credita as
 * quantidades no estoque (Semana 6).
 */
export async function atualizarStatus(id, novoStatus) {
  if (!STATUS_PEDIDO.includes(novoStatus)) {
    return mockError('Status invalido.', 422);
  }
  const pedido = pedidos.find((p) => p.id === Number(id));
  if (!pedido) return mockError('Pedido nao encontrado.', 404);

  if (novoStatus === 'ENTREGUE' && pedido.status !== 'ENTREGUE') {
    pedido.itens.forEach((item) => ajustarSaldoLocal(item.produtoId, Number(item.quantidade)));
  }

  pedidos = pedidos.map((p) => (p.id === Number(id) ? { ...p, status: novoStatus } : p));
  const atualizado = pedidos.find((p) => p.id === Number(id));
  return mockResponse({ ...atualizado, total: calcularTotal(atualizado.itens) });
}
