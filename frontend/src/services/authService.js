import usuariosMock from '../mocks/usuariosMock.json';
import { mockResponse, mockError } from './mockAdapter.js';
import { TOKEN_KEY, USER_KEY } from './storageKeys.js';

// Fase 1: valida credenciais contra usuariosMock.json.
// Fase 2 (Semana 5): substituir por POST em /auth/login via api.js.
export async function login(email, senha) {
  const usuario = usuariosMock.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.senha === senha,
  );

  if (!usuario) {
    return mockError('Credenciais invalidas.', 401);
  }

  // Token simulado. Em producao, e emitido pelo Spring Security (JWT).
  const fakeToken = `mock-jwt.${btoa(usuario.email)}.${Date.now()}`;
  const perfilData = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
  };

  await mockResponse(true);
  return { token: fakeToken, usuario: perfilData };
}

export function persistSession(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
