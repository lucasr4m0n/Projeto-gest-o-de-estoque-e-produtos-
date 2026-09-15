import { useState } from 'react';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  removerCategoria,
} from '../../services/categoriaService.js';
import { isRequired } from '../../utils/validators.js';

export default function Categorias() {
  const toast = useToast();
  const { data: categorias, loading, refetch } = useFetch(listarCategorias, [], {
    onError: (err) => toast.error(err.message || 'Falha ao carregar categorias.'),
  });

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState(null);

  function abrirNovo() {
    setEditando(null);
    setForm({ nome: '', descricao: '' });
    setErrors({});
    setModalAberto(true);
  }

  function abrirEdicao(categoria) {
    setEditando(categoria);
    setForm({ nome: categoria.nome, descricao: categoria.descricao || '' });
    setErrors({});
    setModalAberto(true);
  }

  async function salvar() {
    if (!isRequired(form.nome)) {
      setErrors({ nome: 'Nome obrigatorio.' });
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await atualizarCategoria(editando.id, form);
        toast.success('Categoria atualizada.');
      } else {
        await criarCategoria(form);
        toast.success('Categoria cadastrada.');
      }
      setModalAberto(false);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function remover(categoria) {
    setRemovendoId(categoria.id);
    try {
      await removerCategoria(categoria.id);
      toast.info(`Categoria "${categoria.nome}" removida.`);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Falha ao remover.');
    } finally {
      setRemovendoId(null);
    }
  }

  const colunas = [
    { key: 'nome', header: 'Categoria', render: (c) => <span className="font-medium">{c.nome}</span> },
    { key: 'descricao', header: 'Descricao' },
    {
      key: 'acoes',
      header: 'Acoes',
      render: (c) => (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => abrirEdicao(c)}>
            Editar
          </Button>
          <Button
            variant="ghost"
            className="text-danger-600"
            onClick={() => remover(c)}
            loading={removendoId === c.id}
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
          <h1 className="text-lg font-semibold text-base-900">Categorias</h1>
          <p className="text-sm text-base-500">Classificacao dos produtos</p>
        </div>
        <Button onClick={abrirNovo}>Nova categoria</Button>
      </div>

      <Table columns={colunas} data={categorias || []} loading={loading} />

      <Modal
        open={modalAberto}
        title={editando ? 'Editar categoria' : 'Nova categoria'}
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
            label="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            error={errors.nome}
          />
          <Input
            label="Descricao"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
