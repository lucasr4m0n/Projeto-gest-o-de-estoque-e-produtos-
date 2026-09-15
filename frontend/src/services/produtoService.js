import produtosMock from '../mocks/produtosMock.json';
import { mockResponse, mockError } from './mockAdapter.js';

// Store em memoria inicializado a partir do mock (copia, para nao mutar o JSON).
let produtos = JSON.parse(JSON.stringify(produtosMock));
let nextId = Math.max(...produtos.map((p) => p.id), 0) + 1;

export async function listarProdutos() {
  return mockResponse(produtos);
}

export async function obterProduto(id) {
  const produto = produtos.find((p) => p.id === Number(id));
  if (!produto) return mockError('Produto nao encontrado.', 404);
  return mockResponse(produto);
}

export async function criarProduto(dados) {
  const novo = {
    id: nextId,
    ativo: true,
    saldoAtual: 0,
    ...dados,
    preco: Number(dados.preco),
    estoqueMinimo: Number(dados.estoqueMinimo),
    categoriaId: Number(dados.categoriaId),
    fornecedorId: Number(dados.fornecedorId),
  };
  nextId += 1;
  produtos = [...produtos, novo];
  return mockResponse(novo);
}

export async function atualizarProduto(id, dados) {
  const idx = produtos.findIndex((p) => p.id === Number(id));
  if (idx === -1) return mockError('Produto nao encontrado.', 404);
  const atualizado = {
    ...produtos[idx],
    ...dados,
    preco: Number(dados.preco),
    estoqueMinimo: Number(dados.estoqueMinimo),
    categoriaId: Number(dados.categoriaId),
    fornecedorId: Number(dados.fornecedorId),
  };
  produtos = produtos.map((p) => (p.id === Number(id) ? atualizado : p));
  return mockResponse(atualizado);
}

export async function inativarProduto(id) {
  const idx = produtos.findIndex((p) => p.id === Number(id));
  if (idx === -1) return mockError('Produto nao encontrado.', 404);
  produtos = produtos.map((p) => (p.id === Number(id) ? { ...p, ativo: false } : p));
  return mockResponse(produtos[idx]);
}

// Ajuste de saldo usado pelo modulo de movimentacoes/compras.
export function ajustarSaldoLocal(produtoId, delta) {
  produtos = produtos.map((p) =>
    p.id === Number(produtoId) ? { ...p, saldoAtual: p.saldoAtual + delta } : p,
  );
}

export function _getProdutos() {
  return produtos;
}
