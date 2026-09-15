// Formatadores de exibicao (pt-BR).

export function formatCurrency(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatNumber(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR');
}

export function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
}

export function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Verdadeiro quando o saldo atual esta no limite critico (RN-F01). */
export function isEstoqueCritico(saldoAtual, estoqueMinimo) {
  return Number(saldoAtual) <= Number(estoqueMinimo);
}
