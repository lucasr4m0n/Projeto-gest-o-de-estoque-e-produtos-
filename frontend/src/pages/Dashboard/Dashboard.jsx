import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { obterIndicadores } from '../../services/dashboardService.js';
import { formatCurrency, formatNumber } from '../../utils/formatters.js';
import Spinner from '../../components/Spinner.jsx';
import Badge from '../../components/Badge.jsx';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';

function Card({ titulo, valor, tom = 'neutral' }) {
  const cores = {
    neutral: 'text-base-900',
    danger: 'text-danger-600',
    warn: 'text-warn-600',
    success: 'text-accent-700',
  };
  return (
    <div className="card p-5">
      <p className="text-sm text-base-500">{titulo}</p>
      <p className={`mt-2 text-2xl font-semibold ${cores[tom]}`}>{valor}</p>
    </div>
  );
}

export default function Dashboard() {
  const toast = useToast();
  const { data, loading, error, refetch } = useFetch(obterIndicadores, [], {
    onError: (err) => toast.error(err.message || 'Falha ao carregar indicadores.'),
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm font-medium text-danger-600">Nao foi possivel carregar o dashboard.</p>
        <p className="mt-1 text-sm text-base-500">{error?.message || 'Tente novamente.'}</p>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => refetch().catch(() => {})}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  const { cards, criticos, estoquePorCategoria, movimentacaoPorDia } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-base-900">Dashboard</h1>
        <p className="text-sm text-base-500">Indicadores gerais do estoque</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card titulo="Total estocado (itens)" valor={formatNumber(cards.totalEstocado)} />
        <Card titulo="Valor investido" valor={formatCurrency(cards.valorInvestido)} tom="success" />
        <Card
          titulo="Produtos criticos"
          valor={formatNumber(cards.produtosCriticos)}
          tom={cards.produtosCriticos > 0 ? 'danger' : 'neutral'}
        />
        <Card
          titulo="Pedidos pendentes"
          valor={formatNumber(cards.pedidosPendentes)}
          tom={cards.pedidosPendentes > 0 ? 'warn' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-base-700">Estoque por categoria</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estoquePorCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ebee" />
                <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="quantidade" name="Quantidade" fill="#0b7f5c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-base-700">Movimentacao por dia</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={movimentacaoPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ebee" />
                <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="entradas"
                  name="Entradas"
                  stroke="#0b7f5c"
                  fill="#c9f0e2"
                />
                <Area
                  type="monotone"
                  dataKey="saidas"
                  name="Saidas"
                  stroke="#b62d2d"
                  fill="#fbd5d5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-base-700">Produtos com estoque critico</h2>
        <Table
          columns={[
            { key: 'nome', header: 'Produto' },
            {
              key: 'saldoAtual',
              header: 'Saldo atual',
              render: (p) => (
                <span className="inline-flex items-center gap-2">
                  {p.saldoAtual}
                  <Badge tone="danger">Critico</Badge>
                </span>
              ),
            },
            { key: 'estoqueMinimo', header: 'Estoque minimo' },
          ]}
          data={criticos}
          emptyMessage="Nenhum produto em nivel critico."
        />
      </div>
    </div>
  );
}
