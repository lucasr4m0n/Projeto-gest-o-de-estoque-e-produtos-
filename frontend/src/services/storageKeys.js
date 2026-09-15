// Chaves de armazenamento local da sessao.
// Mantidas isoladas de api.js para permitir uso em qualquer contexto
// (inclusive testes) sem carregar a instancia do Axios.
export const TOKEN_KEY = '@EstoqueApp:token';
export const USER_KEY = '@EstoqueApp:user';
