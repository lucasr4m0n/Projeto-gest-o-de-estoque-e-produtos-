import categoriasMock from '../mocks/categoriasMock.json';
import { mockResponse, mockError } from './mockAdapter.js';

let categorias = JSON.parse(JSON.stringify(categoriasMock));
let nextId = Math.max(...categorias.map((c) => c.id), 0) + 1;

export async function listarCategorias() {
  return mockResponse(categorias);
}

export async function criarCategoria(dados) {
  const nova = { id: nextId, ...dados };
  nextId += 1;
  categorias = [...categorias, nova];
  return mockResponse(nova);
}

export async function atualizarCategoria(id, dados) {
  const idx = categorias.findIndex((c) => c.id === Number(id));
  if (idx === -1) return mockError('Categoria nao encontrada.', 404);
  const atualizada = { ...categorias[idx], ...dados };
  categorias = categorias.map((c) => (c.id === Number(id) ? atualizada : c));
  return mockResponse(atualizada);
}

export async function removerCategoria(id) {
  const idx = categorias.findIndex((c) => c.id === Number(id));
  if (idx === -1) return mockError('Categoria nao encontrada.', 404);
  categorias = categorias.filter((c) => c.id !== Number(id));
  return mockResponse({ id: Number(id) });
}
