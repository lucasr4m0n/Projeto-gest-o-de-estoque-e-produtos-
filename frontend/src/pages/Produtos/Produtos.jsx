import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table.jsx";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import Select from "../../components/Select.jsx";
import Modal from "../../components/Modal.jsx";
import Pagination from "../../components/Pagination.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { useToast } from "../../hooks/useToast.js";
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  inativarProduto,
  ativarProduto,
} from "../../services/produtoService.js";
import { listarCategorias } from "../../services/categoriaService.js";
import { formatCurrency, isEstoqueCritico } from "../../utils/formatters.js";
import { isRequired, isPositiveNumber } from "../../utils/validators.js";

const PAGE_SIZE = 5;

const UNIDADES = ["UN", "KG", "SC", "CX", "PCT", "L", "M"];

const FORM_VAZIO = {
  nome: "",
  descricao: "",
  categoriaId: "",
  unidade: "UN",
  preco: "",
  estoqueMinimo: "",
};

export default function Produtos() {
  const toast = useToast();
  const {
    data: produtos,
    loading,
    refetch,
  } = useFetch(listarProdutos, [], {
    onError: (err) => toast.error(err.message || "Falha ao carregar produtos."),
  });
  const { data: categorias, loading: loadingCategorias } = useFetch(
    listarCategorias,
    [],
    {
      onError: (err) =>
        toast.error(err.message || "Falha ao carregar categorias."),
    },
  );

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [inativandoId, setInativandoId] = useState(null);
  const [page, setPage] = useState(1);

  const nomeCategoria = useMemo(() => {
    const mapa = {};
    (categorias || []).forEach((c) => {
      mapa[c.id] = c.nome;
    });
    return mapa;
  }, [categorias]);

  const listaFiltrada = useMemo(() => {
    return (produtos || []).filter((p) => {
      const casaBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
      const casaCategoria =
        !filtroCategoria || p.categoriaId === Number(filtroCategoria);
      return casaBusca && casaCategoria;
    });
  }, [produtos, busca, filtroCategoria]);

  const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const listaPaginada = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return listaFiltrada.slice(start, start + PAGE_SIZE);
  }, [listaFiltrada, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [busca, filtroCategoria]);

  function abrirNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErrors({});
    setModalAberto(true);
  }

  function abrirEdicao(produto) {
    setEditando(produto);
    setForm({
      nome: produto.nome,
      descricao: produto.descricao || "",
      categoriaId: String(produto.categoriaId),
      unidade: UNIDADES.includes(produto.unidade) ? produto.unidade : "UN",
      preco: String(produto.preco),
      estoqueMinimo: String(produto.estoqueMinimo),
    });
    setErrors({});
    setModalAberto(true);
  }

  function validar() {
    const next = {};
    if (!isRequired(form.nome)) next.nome = "Nome obrigatorio.";
    if (!isRequired(form.categoriaId))
      next.categoriaId = "Selecione a categoria.";
    if (!isPositiveNumber(form.preco))
      next.preco = "Preco deve ser maior que zero.";
    if (Number(form.estoqueMinimo) < 0 || form.estoqueMinimo === "")
      next.estoqueMinimo = "Informe o estoque minimo.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function salvar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      if (editando) {
        await atualizarProduto(editando.id, form);
        toast.success("Produto atualizado.");
      } else {
        await criarProduto(form);
        toast.success("Produto cadastrado.");
      }
      setModalAberto(false);
      await refetch();
    } catch (err) {
      toast.error(err.message || "Falha ao salvar produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function inativar(produto) {
    setInativandoId(produto.id);
    try {
      await inativarProduto(produto.id);
      toast.info(`Produto "${produto.nome}" inativado.`);
      await refetch();
    } catch (err) {
      toast.error(err.message || "Falha ao inativar.");
    } finally {
      setInativandoId(null);
    }
  }

  async function ativar(produto) {
    setInativandoId(produto.id);
    try {
      await ativarProduto(produto.id);
      toast.success(`Produto "${produto.nome}" ativado.`);
      await refetch();
    } catch (err) {
      toast.error(err.message || "Falha ao ativar.");
    } finally {
      setInativandoId(null);
    }
  }

  const colunas = [
    {
      key: "nome",
      header: "Produto",
      render: (p) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium text-base-900">{p.nome}</p>
            <p className="text-xs text-base-400">
              {nomeCategoria[p.categoriaId] || "-"}
            </p>
          </div>
          {p.ativo === false && <Badge tone="neutral">Inativo</Badge>}
        </div>
      ),
    },
    {
      key: "saldoAtual",
      header: "Saldo",
      render: (p) => (
        <span className="inline-flex items-center gap-2">
          {p.saldoAtual} {p.unidade}
          {isEstoqueCritico(p.saldoAtual, p.estoqueMinimo) && (
            <Badge tone="danger">Critico</Badge>
          )}
        </span>
      ),
    },
    { key: "estoqueMinimo", header: "Min." },
    { key: "preco", header: "Preco", render: (p) => formatCurrency(p.preco) },
    {
      key: "acoes",
      header: "Acoes",
      render: (p) => (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => abrirEdicao(p)}>
            Editar
          </Button>
          {p.ativo !== false ? (
            <Button
              variant="ghost"
              className="text-danger-600"
              onClick={() => inativar(p)}
              loading={inativandoId === p.id}
            >
              Inativar
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => ativar(p)}
              loading={inativandoId === p.id}
            >
              Ativar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-base-900">Produtos</h1>
          <p className="text-sm text-base-500">Catalogo e niveis de estoque</p>
        </div>
        <Button onClick={abrirNovo}>Novo produto</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full sm:w-64"
          aria-label="Buscar produto"
        />
        <Select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          placeholder={
            loadingCategorias
              ? "Carregando categorias..."
              : "Todas as categorias"
          }
          disabled={loadingCategorias}
          options={(categorias || []).map((c) => ({
            value: String(c.id),
            label: c.nome,
          }))}
          className="w-full sm:w-56"
          aria-label="Filtrar por categoria"
        />
      </div>

      <Table columns={colunas} data={listaPaginada} loading={loading} />
      {!loading && (produtos || []).length > 0 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={listaFiltrada.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={modalAberto}
        title={editando ? "Editar produto" : "Novo produto"}
        onClose={() => setModalAberto(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={salvar}
              loading={salvando}
              disabled={loadingCategorias}
            >
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
          <Select
            label="Categoria"
            value={form.categoriaId}
            onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
            options={(categorias || []).map((c) => ({
              value: String(c.id),
              label: c.nome,
            }))}
            placeholder={
              loadingCategorias ? "Carregando categorias..." : "Selecione..."
            }
            disabled={loadingCategorias}
            error={errors.categoriaId}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Unidade"
              value={form.unidade}
              onChange={(e) => setForm({ ...form, unidade: e.target.value })}
              options={UNIDADES.map((u) => ({ value: u, label: u }))}
            />
            <Input
              label="Preco (R$)"
              type="number"
              step="0.01"
              min="0"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
              error={errors.preco}
            />
            <Input
              label="Estoque minimo"
              type="number"
              min="0"
              value={form.estoqueMinimo}
              onChange={(e) =>
                setForm({ ...form, estoqueMinimo: e.target.value })
              }
              error={errors.estoqueMinimo}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
