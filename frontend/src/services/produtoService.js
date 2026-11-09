import api from './api.js';

export async function listarProdutos() {
  const response = await api.get('/produtos');
  return response.data;
}

export async function obterProduto(id) {
  const response = await api.get(`/produtos/${id}`);
  return response.data;
}

export async function criarProduto(dados) {
  const response = await api.post('/produtos', dados);
  return response.data;
}

export async function atualizarProduto(id, dados) {
  const response = await api.put(`/produtos/${id}`, dados);
  return response.data;
}

export async function inativarProduto(id) {
  // Nota: Se o teu back-end utilizar um endpoint específico de patch/inativação 
  // (ex: /produtos/${id}/inativar), podes ajustá-lo aqui. Caso contrário, 
  // assumimos o DELETE padrão ou a inativação via API.
  const response = await api.delete(`/produtos/${id}`);
  return response.data;
}