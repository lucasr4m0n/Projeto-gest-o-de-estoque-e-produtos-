import { useState } from 'react';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import {
  listarFornecedores,
  criarFornecedor,
  atualizarFornecedor,
  removerFornecedor,
} from '../../services/fornecedorService.js';
import { isRequired, isValidEmail, isValidCNPJ, maskCNPJ } from '../../utils/validators.js';

const FORM_VAZIO = { nome: '', cnpj: '', email: '', telefone: '' };

export default function Fornecedores() {
  const toast = useToast();
  const { data: fornecedores, loading, refetch } = useFetch(listarFornecedores, [], {
    onError: (err) => toast.error(err.message || 'Falha ao carregar fornecedores.'),
  });

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState(null);

  function abrirNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErrors({});
    setModalAberto(true);
  }

  function abrirEdicao(fornecedor) {
    setEditando(fornecedor);
    setForm({
      nome: fornecedor.nome,
      cnpj: fornecedor.cnpj,
      email: fornecedor.email,
      telefone: fornecedor.telefone || '',
    });
    setErrors({});
    setModalAberto(true);
  }

  function validar() {
    const next = {};
    if (!isRequired(form.nome)) next.nome = 'Nome obrigatorio.';
    if (!isValidCNPJ(form.cnpj)) next.cnpj = 'CNPJ invalido.';
    if (!isValidEmail(form.email)) next.email = 'E-mail invalido.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function salvar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      if (editando) {
        await atualizarFornecedor(editando.id, form);
        toast.success('Fornecedor atualizado.');
      } else {
        await criarFornecedor(form);
        toast.success('Fornecedor cadastrado.');
      }
      setModalAberto(false);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function remover(fornecedor) {
    setRemovendoId(fornecedor.id);
    try {
      await removerFornecedor(fornecedor.id);
      toast.info(`Fornecedor "${fornecedor.nome}" removido.`);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Falha ao remover.');
    } finally {
      setRemovendoId(null);
    }
  }

  const colunas = [
    { key: 'nome', header: 'Fornecedor', render: (f) => <span className="font-medium">{f.nome}</span> },
    { key: 'cnpj', header: 'CNPJ' },
    { key: 'email', header: 'E-mail' },
    { key: 'telefone', header: 'Telefone' },
    {
      key: 'acoes',
      header: 'Acoes',
      render: (f) => (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => abrirEdicao(f)}>
            Editar
          </Button>
          <Button
            variant="ghost"
            className="text-danger-600"
            onClick={() => remover(f)}
            loading={removendoId === f.id}
          >
            Remover
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-base-900">Fornecedores</h1>
          <p className="text-sm text-base-500">Cadastro de parceiros comerciais</p>
        </div>
        <Button onClick={abrirNovo}>Novo fornecedor</Button>
      </div>

      <Table columns={colunas} data={fornecedores || []} loading={loading} />

      <Modal
        open={modalAberto}
        title={editando ? 'Editar fornecedor' : 'Novo fornecedor'}
        onClose={() => setModalAberto(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} loading={salvando}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Razao social / Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            error={errors.nome}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="CNPJ"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: maskCNPJ(e.target.value) })}
              error={errors.cnpj}
              placeholder="00.000.000/0000-00"
            />
            <Input
              label="Telefone"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
        </div>
      </Modal>
    </div>
  );
}
