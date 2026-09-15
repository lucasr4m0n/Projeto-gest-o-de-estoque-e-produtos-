// Adaptador de dados mockados (Fase 1 - Semanas 1 e 2).
// Simula o atraso de rede e resolve Promessas com copias dos dados,
// preservando os arquivos JSON de origem imutaveis.
//
// Na Semana 5 (integracao), os services passam a usar a instancia real
// do Axios (src/services/api.js) no lugar destas funcoes.

const DELAY_MIN = 300;
const DELAY_MAX = 500;

function randomDelay() {
  return Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
}

/** Resolve com uma copia profunda dos dados apos um atraso simulado. */
export function mockResponse(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data)));
    }, randomDelay());
  });
}

/** Rejeita com uma mensagem apos um atraso simulado. */
export function mockError(message, status = 400) {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      const err = new Error(message);
      err.status = status;
      reject(err);
    }, randomDelay());
  });
}
