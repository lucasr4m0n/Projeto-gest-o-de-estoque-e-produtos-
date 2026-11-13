import api from './api.js';

// O back-end usa "razaoSocial" e CNPJ so com 14 digitos; a tela usa "nome" e CNPJ com mascara.
function montarPayloadFornecedor(dados) {
  return {
    razaoSocial: dados.nome,
    cnpj: String(dados.cnpj).replace(/\D/g, ''),
    email: dados.email,
    telefone: dados.telefone,
  };
}

function formatarCnpj(cnpj) {
  return String(cnpj)
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function normalizarFornecedor({ razaoSocial, cnpj, telefone, ...resto }) {
  return {
    ...resto,
    nome: razaoSocial,
    cnpj: formatarCnpj(cnpj),
    telefone: telefone ?? '',
  };
}

export async function listarFornecedores() {
  const response = await api.get('/fornecedores');
  return response.data.map(normalizarFornecedor);
}

export async function criarFornecedor(dados) {
  const response = await api.post('/fornecedores', montarPayloadFornecedor(dados));
  return normalizarFornecedor(response.data);
}

export async function atualizarFornecedor(id, dados) {
  const response = await api.put(`/fornecedores/${id}`, montarPayloadFornecedor(dados));
  return normalizarFornecedor(response.data);
}

export async function removerFornecedor(id) {
  const response = await api.delete(`/fornecedores/${id}`);
  return response.data;
}