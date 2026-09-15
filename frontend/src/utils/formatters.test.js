import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  isEstoqueCritico,
} from './formatters.js';

describe('formatCurrency', () => {
  it('formata em BRL', () => {
    expect(formatCurrency(10)).toContain('10,00');
    expect(formatCurrency(10)).toContain('R$');
  });

  it('trata valores invalidos como zero', () => {
    expect(formatCurrency('abc')).toContain('0,00');
  });
});

describe('formatNumber', () => {
  it('formata numeros no padrao pt-BR', () => {
    expect(formatNumber(1000)).toBe('1.000');
  });
});

describe('formatDate / formatDateTime', () => {
  it('retorna traco para valores ausentes ou invalidos', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('data-invalida')).toBe('-');
    expect(formatDateTime(null)).toBe('-');
    expect(formatDateTime('xxx')).toBe('-');
  });

  it('formata datas validas', () => {
    expect(formatDate('2025-08-01T09:00:00')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(formatDateTime('2025-08-01T09:00:00')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('isEstoqueCritico (RN-F01)', () => {
  it('e critico quando saldo <= minimo', () => {
    expect(isEstoqueCritico(5, 5)).toBe(true);
    expect(isEstoqueCritico(3, 5)).toBe(true);
  });

  it('nao e critico quando saldo > minimo', () => {
    expect(isEstoqueCritico(6, 5)).toBe(false);
  });
});
