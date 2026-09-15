import { useMemo, useState } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../hooks/useAuth.js';
import { listarMovimentacoes, registrarMovimentacao } from '../../services/movimentacaoService.js';
import { listarProdutos } from '../../services/produtoService.js';
import { formatDateTime } from '../../utils/formatters.js';
import { validarBaixaEstoque, isPositiveNumber } from '../../utils/validators.js';

const FORM_VAZIO = { produtoId: '', tipo: 'ENTRADA', quantidade: '', justificativa: '' };

export default function Movimentacoes() {
  const toast = useToast();
  const { user } = useAuth();
  const { data: movimentacoes, loading, refetch } = useFetch(listarMovimentacoes, [], {
    onError: (err) => toast.error(err.message || 'Falha ao carregar movimentacoes.'),
  });
  const { data: produtos, loading: loadingProdutos, refetch: refetchProdutos } = useFetch(
    listarProdutos,
    [],
    { onError: (err) => toast.error(err.message || 'Falha ao carregar produtos.') },
  );

  const [form, setForm] = useState(FORM_VAZIO);
  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);

  const produtoSelecionado = useMemo(
    () => (produtos || []).find((p) => p.id === Number(form.produtoId)),
    [produtos, form.produtoId],
  );

  function validar() {
    const next = {};
    if (!form.produtoId) next.produtoId = 'Selecione o produto.';

    if (!isPositiveNumber(form.quantidade)) {
      // RN-F02: nao permite quantidade <= 0.
      next.quantidade = 'A quantidade deve ser maior que zero.';
    } else if (form.tipo === 'SAIDA' && produtoSelecionado) {
      // RN-F02: nao permite saida superior ao saldo conhecido no cliente.
      const erro = validarBaixaEstoque(form.quantidade, produtoSelecionado.saldoAtual);
      if (erro) next.quantidade = erro;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    setSalvando(true);
    try {
      await registrarMovimentacao({ ...form, usuario: user?.nome });
      toast.success('Movimentacao registrada.');
      setForm(FORM_VAZIO);
      await Promise.all([refetch(), refetchProdutos()]);
    } catch (err) {
      toast.error(err.message || 'Falha ao registrar movimentacao.');
    } finally {
      setSalvando(false);
    }
  }

  const colunas = [
    { key: 'data', header: 'Data', render: (m) => formatDateTime(m.data) },
    { key: 'produtoNome', header: 'Produto' },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (m) => (
        <Badge tone={m.tipo === 'ENTRADA' ? 'success' : 'danger'}>{m.tipo}</Badge>
      ),
    },
    { key: 'quantidade', header: 'Qtd.' },
    { key: 'justificativa', header: 'Justificativa' },
    { key: 'usuario', header: 'Responsavel' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-base-900">Movimentacao de estoque</h1>
        <p className="text-sm text-base-500">Registre entradas e baixas</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-5" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Produto"
            value={form.produtoId}
            onChange={(e) => setForm({ ...form, produtoId: e.target.value })}
            options={(produtos || [])
              .filter((p) => p.ativo !== false)
              .map((p) => ({ value: String(p.id), label: `${p.nome} (saldo: ${p.saldoAtual})` }))}
            placeholder={loadingProdutos ? 'Carregando produtos...' : 'Selecione...'}
            disabled={loadingProdutos}
            error={errors.produtoId}
          />
          <Select
            label="Tipo"
            value={form.tipo}
            placeholder=""
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            options={[
              { value: 'ENTRADA', label: 'Entrada' },
              { value: 'SAIDA', label: 'Saida' },
            ]}
          />
          <Input
            label="Quantidade"
            type="number"
            min="1"
            value={form.quantidade}
            onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
            error={errors.quantidade}
          />
          <Input
            label="Justificativa"
            value={form.justificativa}
            onChange={(e) => setForm({ ...form, justificativa: e.target.value })}
          />
        </div>

        {produtoSelecionado && form.tipo === 'SAIDA' && (
          <p className="text-xs text-base-500">
            Saldo disponivel: <strong>{produtoSelecionado.saldoAtual}</strong>{' '}
            {produtoSelecionado.unidade}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={salvando}>
            Registrar movimentacao
          </Button>
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-base-700">Historico de lancamentos</h2>
        <Table columns={colunas} data={movimentacoes || []} loading={loading} />
      </div>
    </div>
  );
}
