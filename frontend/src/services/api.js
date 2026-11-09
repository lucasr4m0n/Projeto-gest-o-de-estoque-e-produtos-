import axios from 'axios';
import { TOKEN_KEY, USER_KEY } from './storageKeys.js';
import { API_URL } from './env.js';

export { TOKEN_KEY, USER_KEY };

const api = axios.create({ baseURL: API_URL });

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