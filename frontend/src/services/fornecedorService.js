import fornecedoresMock from '../mocks/fornecedoresMock.json';
import { mockResponse, mockError } from './mockAdapter.js';

let fornecedores = JSON.parse(JSON.stringify(fornecedoresMock));
let nextId = Math.max(...fornecedores.map((f) => f.id), 0) + 1;

export async function listarFornecedores() {
  return mockResponse(fornecedores);
}

export async function criarFornecedor(dados) {
  const novo = { id: nextId, ...dados };
  nextId += 1;
  fornecedores = [...fornecedores, novo];
  return mockResponse(novo);
}

export async function atualizarFornecedor(id, dados) {
  const idx = fornecedores.findIndex((f) => f.id === Number(id));
  if (idx === -1) return mockError('Fornecedor nao encontrado.', 404);
  const atualizado = { ...fornecedores[idx], ...dados };
  fornecedores = fornecedores.map((f) => (f.id === Number(id) ? atualizado : f));
  return mockResponse(atualizado);
}

export async function removerFornecedor(id) {
  const idx = fornecedores.findIndex((f) => f.id === Number(id));
  if (idx === -1) return mockError('Fornecedor nao encontrado.', 404);
  fornecedores = fornecedores.filter((f) => f.id !== Number(id));
  return mockResponse({ id: Number(id) });
}
