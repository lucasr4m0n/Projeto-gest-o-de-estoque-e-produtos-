import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout.jsx';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import { ToastProvider } from '../contexts/ToastContext.jsx';
import { TOKEN_KEY, USER_KEY } from '../services/storageKeys.js';

function harness() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<div>Conteudo Dashboard</div>} />
            </Route>
            <Route path="/login" element={<div>Tela Login</div>} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(TOKEN_KEY, 'token');
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ id: 1, nome: 'Admin', email: 'a@a.com', perfil: 'ADMIN' }),
  );
});

describe('Layout', () => {
  it('renderiza navegacao, dados do usuario e conteudo (Outlet)', async () => {
    harness();
    expect(await screen.findByText('Conteudo Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Pedidos de Compra')).toBeInTheDocument();
  });

  it('encerra a sessao ao clicar em Sair', async () => {
    harness();
    await screen.findByText('Conteudo Dashboard');
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    await waitFor(() => expect(screen.getByText('Tela Login')).toBeInTheDocument());
  });
});
