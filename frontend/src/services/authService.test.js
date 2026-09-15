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
});

describe('login', () => {
  it('autentica credenciais validas', async () => {
    const result = await login('admin@estoque.com', 'admin123');
    expect(result.token).toBeTruthy();
    expect(result.usuario.email).toBe('admin@estoque.com');
    expect(result.usuario.perfil).toBe('ADMIN');
  });

  it('rejeita credenciais invalidas', async () => {
    await expect(login('admin@estoque.com', 'errada')).rejects.toThrow(/invalidas/i);
  });
});

describe('sessao', () => {
  it('persiste, recupera e limpa a sessao', () => {
    const user = { id: 1, nome: 'Admin', email: 'a@a.com', perfil: 'ADMIN' };
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
