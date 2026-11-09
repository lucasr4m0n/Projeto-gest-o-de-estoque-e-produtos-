import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils.jsx';
import Categorias from './Categorias.jsx';
import * as catService from '../../services/categoriaService.js';

jest.mock('../../services/categoriaService.js');

beforeEach(() => {
  catService.listarCategorias.mockResolvedValue([
    { id: 1, nome: 'Ferramentas', descricao: 'Manuais e eletricas' },
  ]);
  catService.criarCategoria.mockResolvedValue({ id: 2 });
});

describe('Categorias', () => {
  it('lista categorias e abre modal de cadastro', async () => {
    renderWithProviders(<Categorias />);
    expect(await screen.findByText('Ferramentas')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nova categoria' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('valida nome obrigatorio', async () => {
    renderWithProviders(<Categorias />);
    await screen.findByText('Ferramentas');
    fireEvent.click(screen.getByRole('button', { name: 'Nova categoria' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Nome obrigatorio.')).toBeInTheDocument();
    expect(catService.criarCategoria).not.toHaveBeenCalled();
  });

  it('cria categoria valida', async () => {
    renderWithProviders(<Categorias />);
    await screen.findByText('Ferramentas');
    fireEvent.click(screen.getByRole('button', { name: 'Nova categoria' }));
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'EPI' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(catService.criarCategoria).toHaveBeenCalledTimes(1));
    expect(catService.criarCategoria).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'EPI' }),
    );
  });
});
