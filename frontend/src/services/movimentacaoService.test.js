import { listarMovimentacoes, registrarMovimentacao } from './movimentacaoService.js';
import { obterProduto } from './produtoService.js';

describe('movimentacaoService', () => {
  it('lista o historico ordenado por data (mais recente primeiro)', async () => {
    const lista = await listarMovimentacoes();
    expect(lista.length).toBeGreaterThan(0);
    for (let i = 1; i < lista.length; i += 1) {
      expect(new Date(lista[i - 1].data) >= new Date(lista[i].data)).toBe(true);
    }
  });

  it('registra ENTRADA e credita o saldo', async () => {
    const antes = await obterProduto(1);
    await registrarMovimentacao({
      produtoId: 1,
      tipo: 'ENTRADA',
      quantidade: 5,
      justificativa: 'teste',
      usuario: 'Tester',
    });
    const depois = await obterProduto(1);
    expect(depois.saldoAtual).toBe(antes.saldoAtual + 5);
  });

  it('registra SAIDA valida e debita o saldo', async () => {
    const antes = await obterProduto(1);
    await registrarMovimentacao({
      produtoId: 1,
      tipo: 'SAIDA',
      quantidade: 2,
      justificativa: 'teste',
      usuario: 'Tester',
    });
    const depois = await obterProduto(1);
    expect(depois.saldoAtual).toBe(antes.saldoAtual - 2);
  });

  it('bloqueia SAIDA superior ao saldo (RN-F02)', async () => {
    await expect(
      registrarMovimentacao({ produtoId: 1, tipo: 'SAIDA', quantidade: 99999 }),
    ).rejects.toThrow(/indisponivel/i);
  });

  it('bloqueia quantidade invalida em ENTRADA', async () => {
    await expect(
      registrarMovimentacao({ produtoId: 1, tipo: 'ENTRADA', quantidade: 0 }),
    ).rejects.toThrow(/maior que zero/i);
  });
});
