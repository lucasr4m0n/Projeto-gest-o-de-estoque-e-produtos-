import { useMemo, useState } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Modal from '../../components/Modal.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import {
  listarPedidos,
  criarPedido,
  atualizarStatus,
  calcularTotal,
} from '../../services/compraService.js';
import { listarFornecedores } from '../../services/fornecedorService.js';
import { listarProdutos } from '../../services/produtoService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { isPositiveNumber } from '../../utils/validators.js';

const STATUS_TONE = {
  PENDENTE: 'warn',
  APROVADO: 'neutral',
  ENTREGUE: 'success',
  CANCELADO: 'danger',
};

const PROXIMO_STATUS = {
  PENDENTE: ['APROVADO', 'CANCELADO'],
  APROVADO: ['ENTREGUE', 'CANCELADO'],
  ENTREGUE: [],
  CANCELADO: [],
};

export default function Compras() {
  const toast = useToast();
  const { data: pedidos, loading, refetch } = useFetch(listarPedidos, [], {
    onError: (err) => toast.error(err.message || 'Falha ao carregar pedidos.'),
  });
  const { data: fornecedores, loading: loadingFornecedores } = useFetch(
    listarFornecedores,
    [],
    { onError: (err) => toast.error(err.message || 'Falha ao carregar fornecedores.') },
  );
  const { data: produtos, loading: loadingProdutos } = useFetch(listarProdutos, [], {
    onError: (err) => toast.error(err.message || 'Falha ao carregar produtos.'),
  });

  const [modalAberto, setModalAberto] = useState(false);
  const [fornecedorId, setFornecedorId] = useState('');
  const [itens, setItens] = useState([]);
  const [itemAtual, setItemAtual] = useState({ produtoId: '', quantidade: '' });
  const [salvando, setSalvando] = useState(false);
  const [statusEmAtualizacao, setStatusEmAtualizacao] = useState(null);

  const totalPreview = useMemo(() => calcularTotal(itens), [itens]);

  function abrirNovo() {
    setFornecedorId('');
    setItens([]);
    setItemAtual({ produtoId: '', quantidade: '' });
    setModalAberto(true);
  }

  function adicionarItem() {
    if (!itemAtual.produtoId || !isPositiveNumber(itemAtual.quantidade)) {
      toast.error('Selecione um produto e informe quantidade valida.');
      return;
    }
    const produto = (produtos || []).find((p) => p.id === Number(itemAtual.produtoId));
    setItens([
      ...itens,
      {
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: Number(itemAtual.quantidade),
        precoUnitario: Number(produto.preco),
      },
    ]);
    setItemAtual({ produtoId: '', quantidade: '' });
  }

  function removerItem(index) {
    setItens(itens.filter((_, i) => i !== index));
  }

  async function salvar() {
    if (!fornecedorId) {
      toast.error('Selecione o fornecedor.');
      return;
    }
    if (itens.length === 0) {
      toast.error('Adicione ao menos um item.');
      return;
    }
    setSalvando(true);
    try {
      const fornecedor = (fornecedores || []).find((f) => f.id === Number(fornecedorId));
      await criarPedido({ fornecedorId, fornecedorNome: fornecedor?.nome, itens });
      toast.success('Pedido criado.');
      setModalAberto(false);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Falha ao criar pedido.');
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(pedido, status) {
    const operationKey = `${pedido.id}:${status}`;
    setStatusEmAtualizacao(operationKey);
    try {
      await atualizarStatus(pedido.id, status);
      const msg =
        status === 'ENTREGUE'
          ? 'Pedido entregue. Estoque atualizado.'
          : `Pedido marcado como ${status}.`;
      toast.success(msg);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Falha ao atualizar status.');
    } finally {
      setStatusEmAtualizacao(null);
    }
  }

  const colunas = [
    { key: 'id', header: 'Pedido', render: (p) => `#${p.id}` },
    { key: 'fornecedorNome', header: 'Fornecedor' },
    { key: 'data', header: 'Data', render: (p) => formatDate(p.data) },
    { key: 'itens', header: 'Itens', render: (p) => p.itens.length },
    { key: 'total', header: 'Total', render: (p) => formatCurrency(p.total) },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>,
    },
    {
      key: 'acoes',
      header: 'Acoes',
      render: (p) => (
        <div className="flex flex-wrap gap-2">
          {PROXIMO_STATUS[p.status].map((s) => (
            <Button
              key={s}
              variant={s === 'CANCELADO' ? 'ghost' : 'secondary'}
              className={s === 'CANCELADO' ? 'text-danger-600' : ''}
              onClick={() => mudarStatus(p, s)}
              loading={statusEmAtualizacao === `${p.id}:${s}`}
              disabled={Boolean(statusEmAtualizacao)}
            >
              {s === 'APROVADO' && 'Aprovar'}
              {s === 'ENTREGUE' && 'Marcar entregue'}
              {s === 'CANCELADO' && 'Cancelar'}
            </Button>
          ))}
          {PROXIMO_STATUS[p.status].length === 0 && <span className="text-xs text-base-400">-</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-base-900">Pedidos de compra</h1>
          <p className="text-sm text-base-500">Ordens de reposicao de estoque</p>
        </div>
        <Button onClick={abrirNovo} disabled={loadingFornecedores || loadingProdutos}>
          Novo pedido
        </Button>
      </div>

      <Table columns={colunas} data={pedidos || []} loading={loading} />

      <Modal
        open={modalAberto}
        title="Novo pedido de compra"
        onClose={() => setModalAberto(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} loading={salvando}>
              Criar pedido
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Fornecedor"
            value={fornecedorId}
            onChange={(e) => setFornecedorId(e.target.value)}
            options={(fornecedores || []).map((f) => ({ value: String(f.id), label: f.nome }))}
            placeholder={loadingFornecedores ? 'Carregando fornecedores...' : 'Selecione...'}
            disabled={loadingFornecedores}
          />

          <div className="rounded-md border border-base-200 p-3">
            <p className="mb-2 text-sm font-medium text-base-700">Adicionar item</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
              <Select
                value={itemAtual.produtoId}
                onChange={(e) => setItemAtual({ ...itemAtual, produtoId: e.target.value })}
                options={(produtos || []).map((p) => ({ value: String(p.id), label: p.nome }))}
                placeholder={loadingProdutos ? 'Carregando produtos...' : 'Selecione...'}
                disabled={loadingProdutos}
                aria-label="Produto do item"
              />
              <Input
                type="number"
                min="1"
                placeholder="Qtd."
                value={itemAtual.quantidade}
                onChange={(e) => setItemAtual({ ...itemAtual, quantidade: e.target.value })}
                className="w-24"
                aria-label="Quantidade do item"
              />
              <Button
                variant="secondary"
                onClick={adicionarItem}
                disabled={loadingProdutos}
              >
                Adicionar
              </Button>
            </div>
          </div>

          {itens.length > 0 && (
            <ul className="divide-y divide-base-100 rounded-md border border-base-200">
              {itens.map((item, index) => (
                <li key={index} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>
                    {item.produtoNome} — {item.quantidade} x {formatCurrency(item.precoUnitario)}
                  </span>
                  <button
                    type="button"
                    className="text-danger-600 hover:underline"
                    onClick={() => removerItem(index)}
                  >
                    remover
                  </button>
                </li>
              ))}
              <li className="flex justify-between px-3 py-2 text-sm font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalPreview)}</span>
              </li>
            </ul>
          )}
        </div>
      </Modal>
    </div>
  );
}
