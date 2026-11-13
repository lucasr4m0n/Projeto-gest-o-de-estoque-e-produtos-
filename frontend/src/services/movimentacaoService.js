import api from './api.js';
import { getStoredUser } from './authService.js';

// Back-end: tipoMovimentacao, observacao, dataHora, usuarioNome.
// Tela: tipo, justificativa, data, usuario.
function normalizarMovimentacao(movimentacao) {
  return {
    ...movimentacao,
    tipo: movimentacao.tipoMovimentacao,
    data: movimentacao.dataHora,
    justificativa: movimentacao.observacao,
    usuario: movimentacao.usuarioNome,
  };
}

export async function listarMovimentacoes() {
  const response = await api.get('/movimentacoes');
  return response.data.map(normalizarMovimentacao);
}

export async function registrarMovimentacao(dados) {
  const usuarioId = getStoredUser()?.id || 1;
  const response = await api.post(
    '/movimentacoes',
    {
      produtoId: Number(dados.produtoId),
      tipoMovimentacao: dados.tipo,
      quantidade: Number(dados.quantidade),
      observacao: dados.justificativa,
    },
    { headers: { 'X-Usuario-Id': usuarioId } },
  );
  return normalizarMovimentacao(response.data);
}