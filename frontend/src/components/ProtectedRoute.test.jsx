import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import { TOKEN_KEY, USER_KEY } from '../services/storageKeys.js';

function harness(route, perfis) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Tela de Login</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route
            path="/privado"
            element={
              <ProtectedRoute perfis={perfis}>
                <div>Area Privada</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('ProtectedRoute', () => {
  it('redireciona usuario sem sessao para /login', async () => {
    harness('/privado');
    expect(await screen.findByText('Tela de Login')).toBeInTheDocument();
    expect(screen.queryByText('Area Privada')).not.toBeInTheDocument();
  });

  it('permite acesso com sessao valida', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-valido');
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ id: 1, nome: 'Admin', email: 'a@a.com', perfil: 'ADMIN' }),
    );
    harness('/privado');
    expect(await screen.findByText('Area Privada')).toBeInTheDocument();
  });

  it('bloqueia perfil fora da lista permitida', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-valido');
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ id: 2, nome: 'Operador', email: 'o@a.com', perfil: 'OPERADOR' }),
    );
    harness('/privado', ['ADMIN']);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Area Privada')).not.toBeInTheDocument();
  });
});
