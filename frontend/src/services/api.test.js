import api from './api.js';
import { TOKEN_KEY, USER_KEY } from './storageKeys.js';

const originalLocation = window.location;
const originalAdapter = api.defaults.adapter;

function respostaOk(config) {
  return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
}

function respostaErro(status) {
  return (config) =>
    Promise.reject(
      Object.assign(new Error(`HTTP ${status}`), {
        config,
        response: { status, data: {}, headers: {}, config },
      }),
    );
}

beforeEach(() => {
  localStorage.clear();
  delete window.location;
  window.location = { pathname: '/dashboard', assign: jest.fn() };
});

afterEach(() => {
  window.location = originalLocation;
  api.defaults.adapter = originalAdapter;
});

describe('api - interceptor de requisicao', () => {
  it('injeta o cabecalho Authorization quando ha token', async () => {
    let enviada;
    api.defaults.adapter = (config) => {
      enviada = config;
      return respostaOk(config);
    };
    localStorage.setItem(TOKEN_KEY, 'abc123');

    await api.get('/produtos');

    expect(enviada.headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('nao envia Authorization sem token', async () => {
    let enviada;
    api.defaults.adapter = (config) => {
      enviada = config;
      return respostaOk(config);
    };

    await api.get('/produtos');

    expect(enviada.headers.get('Authorization')).toBeFalsy();
  });
});

describe('api - interceptor de resposta (RN-F04)', () => {
  it.each([401, 403])('limpa a sessao e redireciona para /login em %i', async (status) => {
    api.defaults.adapter = respostaErro(status);
    localStorage.setItem(TOKEN_KEY, 'abc123');
    localStorage.setItem(USER_KEY, JSON.stringify({ nome: 'Admin' }));

    await expect(api.get('/produtos')).rejects.toThrow();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith('/login');
  });

  it('nao redireciona quando ja esta em /login', async () => {
    window.location.pathname = '/login';
    api.defaults.adapter = respostaErro(401);

    await expect(api.get('/auth/login')).rejects.toThrow();

    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('mantem a sessao em outros erros (ex.: 500) e propaga a falha', async () => {
    api.defaults.adapter = respostaErro(500);
    localStorage.setItem(TOKEN_KEY, 'abc123');

    await expect(api.get('/produtos')).rejects.toThrow();

    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc123');
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('repassa respostas de sucesso sem alteracao', async () => {
    api.defaults.adapter = respostaOk;
    const response = await api.get('/produtos');
    expect(response.status).toBe(200);
  });
});