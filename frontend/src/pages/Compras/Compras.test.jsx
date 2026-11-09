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
      status: 'SOLICITADO',
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

async function abrirModalComItem() {
  renderWithProviders(<Compras />);
  await screen.findByText('#1001');
  fireEvent.click(screen.getByRole('button', { name: 'Novo pedido' }));
  await screen.findByRole('dialog');
  fireEvent.change(screen.getByLabelText('Fornecedor'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('Produto do item'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('Quantidade do item'), { target: { value: '5' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
  await screen.findByRole('button', { name: 'remover' });
}

describe('Compras', () => {
  it('lista os pedidos com status', async () => {
    renderWithProviders(<Compras />);
    expect(await screen.findByText('#1001')).toBeInTheDocument();
    expect(screen.getByText('SOLICITADO')).toBeInTheDocument();
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

    it('permite solicitar um pedido em rascunho', async () => {
    compraService.listarPedidos.mockResolvedValue([
      {
        id: 1003,
        fornecedorNome: 'EletroSul',
        data: '2025-08-21T10:00:00',
        status: 'RASCUNHO',
        itens: [],
        total: 0,
      },
    ]);
    renderWithProviders(<Compras />);
    await screen.findByText('#1003');
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar' }));
    await waitFor(() =>
      expect(compraService.atualizarStatus).toHaveBeenCalledWith(1003, 'SOLICITADO'),
    );
  });

  it('permite marcar como entregue um pedido aprovado', async () => {
    compraService.listarPedidos.mockResolvedValue([
      {
        id: 1004,
        fornecedorNome: 'EletroSul',
        data: '2025-08-22T10:00:00',
        status: 'APROVADO',
        itens: [],
        total: 0,
      },
    ]);
    renderWithProviders(<Compras />);
    await screen.findByText('#1004');
    fireEvent.click(screen.getByRole('button', { name: 'Marcar entregue' }));
    await waitFor(() =>
      expect(compraService.atualizarStatus).toHaveBeenCalledWith(1004, 'ENTREGUE'),
    );
  });

    it('avisa quando o item e adicionado sem produto ou quantidade', async () => {
    renderWithProviders(<Compras />);
    await screen.findByText('#1001');
    fireEvent.click(screen.getByRole('button', { name: 'Novo pedido' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(
      await screen.findByText('Selecione um produto e informe quantidade valida.'),
    ).toBeInTheDocument();
  });

  it('exige fornecedor ao criar o pedido', async () => {
    renderWithProviders(<Compras />);
    await screen.findByText('#1001');
    fireEvent.click(screen.getByRole('button', { name: 'Novo pedido' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Criar pedido' }));
    expect(await screen.findByText('Selecione o fornecedor.')).toBeInTheDocument();
    expect(compraService.criarPedido).not.toHaveBeenCalled();
  });

  it('exige ao menos um item ao criar o pedido', async () => {
    renderWithProviders(<Compras />);
    await screen.findByText('#1001');
    fireEvent.click(screen.getByRole('button', { name: 'Novo pedido' }));
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText('Fornecedor'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar pedido' }));
    expect(await screen.findByText('Adicione ao menos um item.')).toBeInTheDocument();
    expect(compraService.criarPedido).not.toHaveBeenCalled();
  });

  it('remove um item da lista antes de criar o pedido', async () => {
    await abrirModalComItem();
    fireEvent.click(screen.getByRole('button', { name: 'remover' }));
    expect(screen.queryByRole('button', { name: 'remover' })).not.toBeInTheDocument();
  });

  it('exibe erro quando a criacao do pedido falha', async () => {
    compraService.criarPedido.mockRejectedValueOnce(new Error('Falha ao salvar'));
    await abrirModalComItem();
    fireEvent.click(screen.getByRole('button', { name: 'Criar pedido' }));
    expect(await screen.findByText('Falha ao salvar')).toBeInTheDocument();
  });

  it('exibe erro quando a atualizacao de status falha', async () => {
    compraService.atualizarStatus.mockRejectedValueOnce(new Error('Status invalido'));
    renderWithProviders(<Compras />);
    await screen.findByText('#1001');
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));
    expect(await screen.findByText('Status invalido')).toBeInTheDocument();
  });

  it('permite cancelar um pedido solicitado', async () => {
    renderWithProviders(<Compras />);
    await screen.findByText('#1001');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() =>
      expect(compraService.atualizarStatus).toHaveBeenCalledWith(1001, 'CANCELADO'),
    );
  });

  it('usa mensagens padrao quando as cargas falham sem mensagem', async () => {
    compraService.listarPedidos.mockRejectedValueOnce(new Error(''));
    fornService.listarFornecedores.mockRejectedValueOnce(new Error(''));
    prodService.listarProdutos.mockRejectedValueOnce(new Error(''));
    renderWithProviders(<Compras />);
    expect(await screen.findByText('Falha ao carregar pedidos.')).toBeInTheDocument();
    expect(await screen.findByText('Falha ao carregar fornecedores.')).toBeInTheDocument();
    expect(await screen.findByText('Falha ao carregar produtos.')).toBeInTheDocument();
  });
});
