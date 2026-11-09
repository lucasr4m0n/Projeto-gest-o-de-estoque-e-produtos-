import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils.jsx';
import Fornecedores from './Fornecedores.jsx';
import * as fornService from '../../services/fornecedorService.js';

jest.mock('../../services/fornecedorService.js');

const FORN = [
  {
    id: 1,
    nome: 'Ferragens Industrial',
    cnpj: '11.222.333/0001-81',
    email: 'contato@f.com',
    telefone: '(91) 3222-1000',
  },
];

beforeEach(() => {
  fornService.listarFornecedores.mockResolvedValue(FORN);
  fornService.criarFornecedor.mockResolvedValue({ id: 2 });
});

describe('Fornecedores', () => {
  it('lista fornecedores cadastrados', async () => {
    renderWithProviders(<Fornecedores />);
    expect(await screen.findByText('Ferragens Industrial')).toBeInTheDocument();
  });

  it('valida CNPJ e e-mail invalidos ao salvar', async () => {
    renderWithProviders(<Fornecedores />);
    await screen.findByText('Ferragens Industrial');

    fireEvent.click(screen.getByRole('button', { name: 'Novo fornecedor' }));
    await screen.findByRole('dialog');

    fireEvent.change(screen.getByLabelText('Razao social / Nome'), {
      target: { value: 'Nova Empresa' },
    });
    fireEvent.change(screen.getByLabelText('CNPJ'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'invalido' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('CNPJ invalido.')).toBeInTheDocument();
    expect(screen.getByText('E-mail invalido.')).toBeInTheDocument();
    expect(fornService.criarFornecedor).not.toHaveBeenCalled();
  });

    it('cria fornecedor com dados validos', async () => {
    renderWithProviders(<Fornecedores />);
    await screen.findByText('Ferragens Industrial');

    fireEvent.click(screen.getByRole('button', { name: 'Novo fornecedor' }));
    await screen.findByRole('dialog');

    fireEvent.change(screen.getByLabelText('Razao social / Nome'), {
      target: { value: 'Nova Empresa' },
    });
    fireEvent.change(screen.getByLabelText('CNPJ'), {
      target: { value: '11.222.333/0001-81' },
    });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'valido@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(fornService.criarFornecedor).toHaveBeenCalledTimes(1));
    expect(fornService.criarFornecedor).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Nova Empresa', email: 'valido@x.com' }),
    );
  });
});
