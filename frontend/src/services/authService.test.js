import {
  login,
  persistSession,
  clearSession,
  getStoredToken,
  getStoredUser,
} from './authService.js';
import { TOKEN_KEY, USER_KEY } from './storageKeys.js';

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe('login', () => {
  it('autentica credenciais validas', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'fake-jwt-token-123',
        tipo: 'Bearer',
        nome: 'Administrador do Sistema',
        email: 'admin@gestao.com',
        perfil: 'ADMIN'
      })
    });

    const result = await login('admin@gestao.com', '123456');
    expect(result.token).toBeTruthy();
    expect(result.usuario.email).toBe('admin@gestao.com');
    expect(result.usuario.perfil).toBe('ADMIN');
  });

  it('rejeita credenciais invalidas', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401
    });

    await expect(login('admin@gestao.com', 'senhaerrada')).rejects.toThrow();
  });
});

describe('sessao', () => {
  it('persiste, recupera e limpa a sessao', () => {
    const user = { nome: 'Admin', email: 'admin@gestao.com', perfil: 'ADMIN' };
    persistSession('token123', user);

    expect(localStorage.getItem(TOKEN_KEY)).toBe('token123');
    expect(getStoredToken()).toBe('token123');
    expect(getStoredUser()).toEqual(user);

    clearSession();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('retorna null quando o usuario armazenado esta corrompido', () => {
    localStorage.setItem(USER_KEY, '{invalido');
    expect(getStoredUser()).toBeNull();
  });
});