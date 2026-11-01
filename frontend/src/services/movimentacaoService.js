import api from './api.js';

export async function listarMovimentacoes() {
  const response = await api.get('/movimentacoes');
  return response.data;
}

export async function registrarMovimentacao(dados) {
  const response = await api.post('/movimentacoes', dados);
  return response.data;
}