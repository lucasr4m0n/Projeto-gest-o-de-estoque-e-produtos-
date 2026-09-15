// Stub do recharts para o ambiente de testes: renderiza containers simples
// sem depender de medicao de dimensoes (indisponivel no jsdom).
const Passthrough = ({ children }) => <div>{children}</div>;

export const ResponsiveContainer = Passthrough;
export const BarChart = Passthrough;
export const LineChart = Passthrough;
export const PieChart = Passthrough;
export const AreaChart = Passthrough;
export const Bar = () => null;
export const Line = () => null;
export const Area = () => null;
export const Pie = () => null;
export const Cell = () => null;
export const XAxis = () => null;
export const YAxis = () => null;
export const CartesianGrid = () => null;
export const Tooltip = () => null;
export const Legend = () => null;
