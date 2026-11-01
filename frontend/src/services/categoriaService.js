import api from './api.js';

export async function listarCategorias() {
  const response = await api.get('/categorias');
  return response.data;
}

export async function criarCategoria(dados) {
  const response = await api.post('/categorias', dados);
  return response.data;
}

export async function atualizarCategoria(id, dados) {
  const response = await api.put(`/categorias/${id}`, dados);
  return response.data;
}

export async function removerCategoria(id) {
  const response = await api.delete(`/categorias/${id}`);
  return response.data;
}