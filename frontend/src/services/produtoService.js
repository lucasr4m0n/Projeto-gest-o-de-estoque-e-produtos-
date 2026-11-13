import api from './api.js';

// Back-end: precoCusto, quantidadeEstoque, unidadeMedida.
// Tela: preco, saldoAtual, unidade.
function normalizarProduto(produto) {
  return {
    ...produto,
    preco: produto.precoCusto,
    saldoAtual: produto.quantidadeEstoque,
    unidade: produto.unidadeMedida,
  };
}

function montarPayloadProduto(dados) {
  return {
    nome: dados.nome,
    descricao: dados.descricao,
    categoriaId: Number(dados.categoriaId),
    precoCusto: Number(dados.preco),
    estoqueMinimo: Number(dados.estoqueMinimo),
    unidadeMedida: dados.unidade,
  };
}

export async function listarProdutos() {
  const response = await api.get('/produtos');
  return response.data.map(normalizarProduto);
}

export async function obterProduto(id) {
  const response = await api.get(`/produtos/${id}`);
  return normalizarProduto(response.data);
}

export async function criarProduto(dados) {
  const response = await api.post('/produtos', montarPayloadProduto(dados));
  return normalizarProduto(response.data);
}

export async function atualizarProduto(id, dados) {
  const response = await api.put(`/produtos/${id}`, montarPayloadProduto(dados));
  return normalizarProduto(response.data);
}

export async function inativarProduto(id) {
  const response = await api.patch(`/produtos/${id}/inativar`);
  return normalizarProduto(response.data);
}

export async function ativarProduto(id) {
  const response = await api.patch(`/produtos/${id}/ativar`);
  return normalizarProduto(response.data);
}