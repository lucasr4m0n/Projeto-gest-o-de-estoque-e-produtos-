import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

// Mocka o authService para o contexto funcionar de forma isolada
jest.mock('../services/authService.js', () => ({
  login: jest.fn(async (email, senha) => {
    if (email === 'admin@gestao.com' && senha === '123456') {
      return {
        token: 'fake-jwt-token',
        usuario: {
          nome: 'Administrador do Sistema',
          email: 'admin@gestao.com',
          perfil: 'ADMIN'
        }
      };
    }
    throw new Error('E-mail ou senha inválidos.');
  }),
  persistSession: jest.fn(),
  clearSession: jest.fn(),
  getStoredToken: jest.fn(() => null),
  getStoredUser: jest.fn(() => null),
}));

function Consumer() {
  const { isAuthenticated, user, signIn, signOut } = useAuth();
  return (
    <div>
      <p>Status: {isAuthenticated ? 'autenticado' : 'anonimo'}</p>
      <p>Usuario: {user?.nome || 'nenhum'}</p>
      <button onClick={() => signIn('admin@gestao.com', '123456')}>entrar</button>
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
  jest.clearAllMocks();
});

describe('AuthContext', () => {
  it('inicia anonimo, autentica e encerra a sessao', async () => {
    setup();
    expect(await screen.findByText('Status: anonimo')).toBeInTheDocument();

    fireEvent.click(screen.getByText('entrar'));
    await waitFor(() => expect(screen.getByText('Status: autenticado')).toBeInTheDocument());
    expect(screen.getByText(/Usuario: Administrador/)).toBeInTheDocument();

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