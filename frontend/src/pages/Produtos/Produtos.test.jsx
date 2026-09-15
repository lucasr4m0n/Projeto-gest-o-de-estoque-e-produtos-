import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils.jsx';
import Produtos from './Produtos.jsx';
import * as prodService from '../../services/produtoService.js';
import * as catService from '../../services/categoriaService.js';
import * as fornService from '../../services/fornecedorService.js';

jest.mock('../../services/produtoService.js');
jest.mock('../../services/categoriaService.js');
jest.mock('../../services/fornecedorService.js');

const PRODUTOS = [
  {
    id: 1,
    nome: 'Furadeira 750W',
    categoriaId: 1,
    fornecedorId: 1,
    unidade: 'UN',
    preco: 389.9,
    saldoAtual: 12,
    estoqueMinimo: 5,
    ativo: true,
  },
  {
    id: 2,
    nome: 'Cabo Flexivel',
    categoriaId: 2,
    fornecedorId: 1,
    unidade: 'RL',
    preco: 245,
    saldoAtual: 3,
    estoqueMinimo: 8,
    ativo: true,
  },
];

beforeEach(() => {
  prodService.listarProdutos.mockResolvedValue(PRODUTOS);
  catService.listarCategorias.mockResolvedValue([
    { id: 1, nome: 'Ferramentas' },
    { id: 2, nome: 'Eletrica' },
  ]);
  fornService.listarFornecedores.mockResolvedValue([{ id: 1, nome: 'Forn A' }]);
});

describe('Produtos', () => {
  it('lista os produtos e destaca estoque critico (RN-F01)', async () => {
    renderWithProviders(<Produtos />);
    expect(await screen.findByText('Furadeira 750W')).toBeInTheDocument();
    expect(screen.getByText('Cabo Flexivel')).toBeInTheDocument();
    // O Cabo (saldo 3 <= minimo 8) deve exibir o badge Critico.
    expect(screen.getByText('Critico')).toBeInTheDocument();
  });

  it('filtra a listagem pela busca por nome (RF-F03)', async () => {
    renderWithProviders(<Produtos />);
    await screen.findByText('Furadeira 750W');
    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'cabo' } });
    await waitFor(() => expect(screen.queryByText('Furadeira 750W')).not.toBeInTheDocument());
    expect(screen.getByText('Cabo Flexivel')).toBeInTheDocument();
  });

  it('abre o modal de novo produto', async () => {
    renderWithProviders(<Produtos />);
    await screen.findByText('Furadeira 750W');
    fireEvent.click(screen.getByRole('button', { name: 'Novo produto' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('pagina o catalogo de produtos', async () => {
    const muitosProdutos = Array.from({ length: 6 }, (_, index) => ({
      id: index + 1,
      nome: `Produto ${index + 1}`,
      categoriaId: 1,
      fornecedorId: 1,
      unidade: 'UN',
      preco: 10,
      saldoAtual: 20,
      estoqueMinimo: 5,
      ativo: true,
    }));
    prodService.listarProdutos.mockResolvedValue(muitosProdutos);

    renderWithProviders(<Produtos />);
    expect(await screen.findByText('Produto 1')).toBeInTheDocument();
    expect(screen.queryByText('Produto 6')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Proxima pagina' }));
    expect(await screen.findByText('Produto 6')).toBeInTheDocument();
    expect(screen.getByText('Pagina 2 de 2')).toBeInTheDocument();
  });
});
