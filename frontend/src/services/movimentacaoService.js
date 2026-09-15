import movimentacoesMock from '../mocks/movimentacoesMock.json';
import { mockResponse, mockError } from './mockAdapter.js';
import { obterProduto, ajustarSaldoLocal } from './produtoService.js';
import { validarBaixaEstoque } from '../utils/validators.js';

let movimentacoes = JSON.parse(JSON.stringify(movimentacoesMock));
let nextId = Math.max(...movimentacoes.map((m) => m.id), 0) + 1;

export async function listarMovimentacoes() {
  // Historico mais recente primeiro.
  const ordenadas = [...movimentacoes].sort((a, b) => new Date(b.data) - new Date(a.data));
  return mockResponse(ordenadas);
}

/**
 * Registra uma movimentacao. Em SAIDA, aplica a validacao de saldo (RN-F02).
 * @param {{produtoId:number,tipo:'ENTRADA'|'SAIDA',quantidade:number,justificativa:string,usuario:string}} dados
 */
export async function registrarMovimentacao(dados) {
  const produto = await obterProduto(dados.produtoId);
  const quantidade = Number(dados.quantidade);

  if (dados.tipo === 'SAIDA') {
    const erro = validarBaixaEstoque(quantidade, produto.saldoAtual);
    if (erro) return mockError(erro, 422);
  } else if (!Number.isFinite(quantidade) || quantidade <= 0) {
    return mockError('A quantidade deve ser maior que zero.', 422);
  }

  const delta = dados.tipo === 'ENTRADA' ? quantidade : -quantidade;
  ajustarSaldoLocal(dados.produtoId, delta);

  const nova = {
    id: nextId,
    produtoId: Number(dados.produtoId),
    produtoNome: produto.nome,
    tipo: dados.tipo,
    quantidade,
    justificativa: dados.justificativa || '',
    data: new Date().toISOString(),
    usuario: dados.usuario || 'Sistema',
  };
  nextId += 1;
  movimentacoes = [...movimentacoes, nova];
  return mockResponse(nova);
}
