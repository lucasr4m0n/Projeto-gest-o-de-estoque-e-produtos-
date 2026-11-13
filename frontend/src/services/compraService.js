import api from './api.js';
import { getStoredUser } from './authService.js';

export const STATUS_PEDIDO = ['RASCUNHO', 'SOLICITADO', 'APROVADO', 'CANCELADO', 'ENTREGUE'];

export function calcularTotal(itens) {
  return (itens || []).reduce(
    (soma, item) => soma + Number(item.quantidade) * Number(item.precoUnitario),
    0,
  );
}

// Back-end: dataPedido. Tela: data.
function normalizarPedido(pedido) {
  return { ...pedido, data: pedido.dataPedido };
}

export async function listarPedidos() {
  const response = await api.get('/compras');
  return response.data.map(normalizarPedido);
}

export async function criarPedido(dados) {
  const response = await api.post('/compras', {
    fornecedorId: Number(dados.fornecedorId),
    itens: dados.itens.map(({ produtoId, quantidade, precoUnitario }) => ({
      produtoId,
      quantidade,
      precoUnitario,
    })),
  });
  return normalizarPedido(response.data);
}

export async function atualizarStatus(id, novoStatus) {
  const user = getStoredUser();
  const usuarioId = user?.id || 1;

  const response = await api.patch(
    `/compras/${id}/status`,
    { status: novoStatus },
    { headers: { 'X-Usuario-Id': usuarioId } },
  );
  return normalizarPedido(response.data);
}