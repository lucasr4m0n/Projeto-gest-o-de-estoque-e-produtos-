import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

function Consumer() {
  const { isAuthenticated, user, signIn, signOut } = useAuth();
  return (
    <div>
      <p>Status: {isAuthenticated ? 'autenticado' : 'anonimo'}</p>
      <p>Usuario: {user?.nome || 'nenhum'}</p>
      <button onClick={() => signIn('admin@estoque.com', 'admin123')}>entrar</button>
      <button onClick={signOut}>sair</button>
    </div>
  );
}

function setup() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('AuthContext', () => {
  it('inicia anonimo, autentica e encerra a sessao', async () => {
    setup();
    expect(await screen.findByText('Status: anonimo')).toBeInTheDocument();

    fireEvent.click(screen.getByText('entrar'));
    await waitFor(() => expect(screen.getByText('Status: autenticado')).toBeInTheDocument());
    expect(screen.getByText('Usuario: Administrador')).toBeInTheDocument();

    fireEvent.click(screen.getByText('sair'));
    await waitFor(() => expect(screen.getByText('Status: anonimo')).toBeInTheDocument());
  });

  it('lanca erro quando useAuth e usado fora do provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    function Solto() {
      useAuth();
      return null;
    }
    expect(() => render(<Solto />)).toThrow(/AuthProvider/);
    spy.mockRestore();
  });
});
