// Funcoes puras de validacao usadas nos formularios do cliente.

export function isRequired(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

export function isValidEmail(value) {
  if (!isRequired(value)) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(value).trim());
}

/**
 * Valida um CNPJ verificando formato e digitos verificadores.
 * Aceita entradas com ou sem mascara.
 */
export function isValidCNPJ(value) {
  if (!isRequired(value)) return false;
  const cnpj = String(value).replace(/\D/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (base) => {
    let length = base.length;
    let pos = length - 7;
    let sum = 0;
    for (let i = length; i >= 1; i -= 1) {
      sum += Number(base[length - i]) * pos;
      pos -= 1;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  const digit1 = calc(cnpj.slice(0, 12));
  const digit2 = calc(cnpj.slice(0, 12) + digit1);
  return cnpj.endsWith(`${digit1}${digit2}`);
}

export function isPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

/**
 * Regra RN-F02: a saida nao pode ser <= 0 nem superior ao saldo disponivel.
 * Retorna uma string de erro ou null quando valido.
 */
export function validarBaixaEstoque(quantidade, saldoDisponivel) {
  const qtd = Number(quantidade);
  if (!Number.isFinite(qtd) || qtd <= 0) {
    return 'A quantidade deve ser maior que zero.';
  }
  if (qtd > Number(saldoDisponivel)) {
    return `Quantidade indisponivel. Saldo atual: ${saldoDisponivel}.`;
  }
  return null;
}

/** Aplica mascara visual de CNPJ (00.000.000/0000-00). */
export function maskCNPJ(value) {
  return String(value)
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
