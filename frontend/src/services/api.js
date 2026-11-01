import axios from 'axios';
import { TOKEN_KEY, USER_KEY } from './storageKeys.js';

export { TOKEN_KEY, USER_KEY };

// URL base segura para o Vite e compatível com o Jest
let baseURL = 'http://localhost:8090/api';

if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
  baseURL = process.env.VITE_API_URL;
} else {
  try {
    // Isola o import.meta para o Jest não falhar no parse estático
    const getMetaEnv = new Function('return typeof import.meta !== "undefined" ? import.meta.env : undefined');
    const env = getMetaEnv();
    if (env && env.VITE_API_URL) {
      baseURL = env.VITE_API_URL;
    }
  } catch (e) {
    // Ignora se não suportado
  }
}

const api = axios.create({ baseURL });

// Interceptor de requisicao: injeta o cabecalho Authorization em chamadas privadas.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: trata sessao expirada (RN-F04).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
