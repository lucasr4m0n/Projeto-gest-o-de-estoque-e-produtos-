import { TOKEN_KEY, USER_KEY } from './storageKeys.js';

const API_URL = 'http://localhost:8090/api';

export async function login(email, senha) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const data = await response.json();

    // O back-end retorna: { token, tipo, nome, email, perfil }
    const perfilData = {
      nome: data.nome,
      email: data.email,
      perfil: data.perfil,
    };

    return { 
      token: data.token, 
      usuario: perfilData 
    };
  } catch (error) {
    throw new Error(error.message || 'Falha ao conectar com o servidor.');
  }
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