import { createContext, useEffect, useMemo, useState } from 'react';
import {
  login as loginService,
  persistSession,
  clearSession,
  getStoredToken,
  getStoredUser,
} from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura a sessao persistida ao montar a aplicacao.
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  async function signIn(email, senha) {
    const { token: newToken, usuario } = await loginService(email, senha);
    persistSession(newToken, usuario);
    setToken(newToken);
    setUser(usuario);
    return usuario;
  }

  function signOut() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
