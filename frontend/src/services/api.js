import axios from 'axios';
import { TOKEN_KEY, USER_KEY } from './storageKeys.js';

export { TOKEN_KEY, USER_KEY };

// URL base da API (Spring Boot). Definida em .env como VITE_API_URL.
const baseURL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  'http://localhost:8080/api';

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
