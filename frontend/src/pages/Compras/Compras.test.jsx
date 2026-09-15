import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils.jsx';
import Compras from './Compras.jsx';
import * as compraService from '../../services/compraService.js';
import * as fornService from '../../services/fornecedorService.js';
import * as prodService from '../../services/produtoService.js';

jest.mock('../../services/compraService.js');
jest.mock('../../services/fornecedorService.js');
jest.mock('../../services/produtoService.js');

beforeEach(() => {
  compraService.calcularTotal.mockImplementation((itens) =>
    (itens || []).reduce((s, i) => s + i.quantidade * i.precoUnitario, 0),
  );
  compraService.listarPedidos.mockResolvedValue([
    {
      id: 1001,
      fornecedorNome: 'EletroSul',
      data: '2025-08-20T11:00:00',
      status: 'PENDENTE',
      itens: [{ produtoId: 2, quantidade: 10, precoUnitario: 245 }],
      total: 2450,
    },
  ]);
  compraService.atualizarStatus.mockResolvedValue({ id: 1001, status: 'APROVADO' });
  compraService.criarPedido.mockResolvedValue({ id: 1002 });
  fornService.listarFornecedores.mockResolvedValue([{ id: 2, nome: 'EletroSul' }]);
  prodService.listarProdutos.mockResolvedValue([
    { id: 2, nome: 'Cabo Flexivel', preco: 245 },
  ]);
});

describe('Compras', () => {
  it('lista os pedidos com status', async () => {
    renderWithProviders(<Compras />);
    expect(await screen.findByText('#1001')).toBeInTheDocument();
    expect(screen.getByText('PENDENTE')).toBeInTheDocument();
  });

  it('aprova um pedido pendente', async () => {
    renderWithProviders(<Compras />);
    await screen.findByText('#1001');
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));
    await waitFor(() =>
      expect(compraService.atualizarStatus).toHaveBeenCalledWith(1001, 'APROVADO'),
    );
  });

  it('monta um pedido com item e cria (RF-F05)', async () => {
    renderWithProviders(<Compras />);
    await screen.findByText('#1001');

    fireEvent.click(screen.getByRole('button', { name: 'Novo pedido' }));
    await screen.findByRole('dialog');

    fireEvent.change(screen.getByLabelText('Fornecedor'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Produto do item'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Quantidade do item'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(
      await screen.findByText(
        (_, node) => node?.tagName === 'LI' && /Cabo Flexivel/.test(node.textContent),
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Criar pedido' }));
    await waitFor(() => expect(compraService.criarPedido).toHaveBeenCalledTimes(1));
  });
});
