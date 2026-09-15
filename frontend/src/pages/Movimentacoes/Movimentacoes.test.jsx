import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils.jsx';
import Movimentacoes from './Movimentacoes.jsx';
import * as movService from '../../services/movimentacaoService.js';
import * as prodService from '../../services/produtoService.js';

jest.mock('../../services/movimentacaoService.js');
jest.mock('../../services/produtoService.js');

const PRODUTO = { id: 1, nome: 'Cabo Flexivel', saldoAtual: 5, unidade: 'RL', ativo: true };

beforeEach(() => {
  localStorage.clear();
  prodService.listarProdutos.mockResolvedValue([PRODUTO]);
  movService.listarMovimentacoes.mockResolvedValue([]);
  movService.registrarMovimentacao.mockResolvedValue({ id: 99 });
});

async function selecionarProduto() {
  await screen.findByText('Historico de lancamentos');
  const selectProduto = screen.getByLabelText('Produto');
  fireEvent.change(selectProduto, { target: { value: '1' } });
}

describe('Movimentacoes (RN-F02)', () => {
  it('bloqueia saida superior ao saldo disponivel', async () => {
    renderWithProviders(<Movimentacoes />);
    await selecionarProduto();

    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'SAIDA' } });
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrar movimentacao/i }));

    expect(await screen.findByText(/indisponivel/i)).toBeInTheDocument();
    expect(movService.registrarMovimentacao).not.toHaveBeenCalled();
  });

  it('bloqueia quantidade igual a zero', async () => {
    renderWithProviders(<Movimentacoes />);
    await selecionarProduto();

    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrar movimentacao/i }));

    expect(await screen.findByText(/maior que zero/i)).toBeInTheDocument();
    expect(movService.registrarMovimentacao).not.toHaveBeenCalled();
  });

  it('registra uma saida valida', async () => {
    renderWithProviders(<Movimentacoes />);
    await selecionarProduto();

    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'SAIDA' } });
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrar movimentacao/i }));

    await waitFor(() => expect(movService.registrarMovimentacao).toHaveBeenCalledTimes(1));
    expect(movService.registrarMovimentacao).toHaveBeenCalledWith(
      expect.objectContaining({ produtoId: '1', tipo: 'SAIDA', quantidade: '3' }),
    );
  });
});
