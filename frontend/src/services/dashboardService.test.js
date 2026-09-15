import { obterIndicadores } from './dashboardService.js';

describe('dashboardService', () => {
  it('consolida os indicadores do painel', async () => {
    const dados = await obterIndicadores();

    expect(dados.cards).toHaveProperty('totalEstocado');
    expect(dados.cards).toHaveProperty('valorInvestido');
    expect(dados.cards).toHaveProperty('produtosCriticos');
    expect(dados.cards).toHaveProperty('pedidosPendentes');

    expect(Array.isArray(dados.criticos)).toBe(true);
    expect(Array.isArray(dados.estoquePorCategoria)).toBe(true);
    expect(Array.isArray(dados.movimentacaoPorDia)).toBe(true);

    // Ha ao menos um produto critico no mock (ex.: Cabo Flexivel).
    expect(dados.cards.produtosCriticos).toBeGreaterThan(0);
    expect(dados.cards.totalEstocado).toBeGreaterThan(0);
  });
});
