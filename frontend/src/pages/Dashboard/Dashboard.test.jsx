import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils.jsx';
import Dashboard from './Dashboard.jsx';
import * as dashService from '../../services/dashboardService.js';

jest.mock('../../services/dashboardService.js');

beforeEach(() => {
  dashService.obterIndicadores.mockResolvedValue({
    cards: {
      totalEstocado: 100,
      valorInvestido: 5000,
      produtosCriticos: 2,
      pedidosPendentes: 1,
    },
    criticos: [{ id: 2, nome: 'Cabo Flexivel', saldoAtual: 3, estoqueMinimo: 8 }],
    estoquePorCategoria: [{ categoria: 'Eletrica', quantidade: 40 }],
    movimentacaoPorDia: [{ dia: '2025-08-01', entradas: 10, saidas: 2 }],
  });
});

describe('Dashboard', () => {
  it('exibe os cards de indicadores (RF-F06)', async () => {
    renderWithProviders(<Dashboard />);
    expect(await screen.findByText('Total estocado (itens)')).toBeInTheDocument();
    expect(screen.getByText('Valor investido')).toBeInTheDocument();
    expect(screen.getByText('Produtos criticos')).toBeInTheDocument();
    expect(screen.getByText('Pedidos pendentes')).toBeInTheDocument();
  });

  it('lista produtos criticos', async () => {
    renderWithProviders(<Dashboard />);
    expect(await screen.findByText('Cabo Flexivel')).toBeInTheDocument();
  });

    it('exibe erro e permite tentar novamente', async () => {
    dashService.obterIndicadores.mockRejectedValueOnce(new Error('Falha de rede'));
    renderWithProviders(<Dashboard />);
    expect(
      await screen.findByText('Nao foi possivel carregar o dashboard.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Total estocado (itens)')).toBeInTheDocument();
  });
});
