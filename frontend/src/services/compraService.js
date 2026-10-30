import api from './api.js';
import { getStoredUser } from './authService.js';

export const STATUS_PEDIDO = ['RASCUNHO', 'SOLICITADO', 'APROVADO', 'CANCELADO', 'ENTREGUE'];

export function calcularTotal(itens) {
  return (itens || []).reduce(
    (soma, item) => soma + Number(item.quantidade) * Number(item.precoUnitario),
    0,
  );
}

export async function listarPedidos() {
  const response = await api.get('/compras');
  return response.data;
}

export async function criarPedido(dados) {
  const response = await api.post('/compras', dados);
  return response.data;
}

export async function atualizarStatus(id, novoStatus) {
  const user = getStoredUser();
  const usuarioId = user?.id || 1; // Obtém o ID do utilizador logado para enviar no cabeçalho exigido pelo Spring Boot

  const response = await api.patch(
    `/compras/${id}/status`,
    { status: novoStatus },
    {
      headers: {
        'X-Usuario-Id': usuarioId,
      },
    }
  );
  return response.data;
}