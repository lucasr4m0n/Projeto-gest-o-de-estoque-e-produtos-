import {
  isRequired,
  isValidEmail,
  isValidCNPJ,
  isPositiveNumber,
  validarBaixaEstoque,
  maskCNPJ,
} from './validators.js';

describe('isRequired', () => {
  it('rejeita valores vazios ou nulos', () => {
    expect(isRequired('')).toBe(false);
    expect(isRequired('   ')).toBe(false);
    expect(isRequired(null)).toBe(false);
    expect(isRequired(undefined)).toBe(false);
  });

  it('aceita valores preenchidos', () => {
    expect(isRequired('abc')).toBe(true);
    expect(isRequired(0)).toBe(true);
  });
});

describe('isValidEmail', () => {
  it('valida e-mails corretos', () => {
    expect(isValidEmail('user@dominio.com')).toBe(true);
  });

  it('rejeita e-mails invalidos', () => {
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('sem-arroba.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidCNPJ', () => {
  it('valida CNPJ com digitos verificadores corretos', () => {
    expect(isValidCNPJ('11.222.333/0001-81')).toBe(true);
    expect(isValidCNPJ('11222333000181')).toBe(true);
  });

  it('rejeita CNPJ com tamanho ou digitos invalidos', () => {
    expect(isValidCNPJ('11.222.333/0001-00')).toBe(false);
    expect(isValidCNPJ('123')).toBe(false);
    expect(isValidCNPJ('00000000000000')).toBe(false);
    expect(isValidCNPJ('')).toBe(false);
  });
});

describe('isPositiveNumber', () => {
  it('aceita apenas numeros maiores que zero', () => {
    expect(isPositiveNumber(5)).toBe(true);
    expect(isPositiveNumber('3')).toBe(true);
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-2)).toBe(false);
    expect(isPositiveNumber('abc')).toBe(false);
  });
});

describe('validarBaixaEstoque (RN-F02)', () => {
  it('bloqueia quantidade menor ou igual a zero', () => {
    expect(validarBaixaEstoque(0, 10)).toMatch(/maior que zero/);
    expect(validarBaixaEstoque(-1, 10)).toMatch(/maior que zero/);
  });

  it('bloqueia saida superior ao saldo disponivel', () => {
    expect(validarBaixaEstoque(11, 10)).toMatch(/indisponivel/i);
  });

  it('permite saida valida', () => {
    expect(validarBaixaEstoque(5, 10)).toBeNull();
    expect(validarBaixaEstoque(10, 10)).toBeNull();
  });
});

describe('maskCNPJ', () => {
  it('aplica a mascara visual', () => {
    expect(maskCNPJ('11222333000181')).toBe('11.222.333/0001-81');
  });
});
