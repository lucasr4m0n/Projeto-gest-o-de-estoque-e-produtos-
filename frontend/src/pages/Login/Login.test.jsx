import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils.jsx';
import Login from './Login.jsx';

// Mocka o authService para os testes de componente não precisarem de servidor real
jest.mock('../../services/authService.js', () => {
  return {
    ...jest.requireActual('../../services/authService.js'),
    login: jest.fn(async (email, senha) => {
      if (email === 'admin@estoque.com' && senha === 'admin123') {
        return {
          token: 'fake-jwt-token',
          usuario: {
            nome: 'Administrador do Sistema',
            email: 'admin@estoque.com',
            perfil: 'ADMIN'
          }
        };
      }
      throw new Error('E-mail ou senha inválidos.');
    }),
  };
});

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('Login', () => {
  it('valida campos obrigatorios antes de enviar', async () => {
    renderWithProviders(<Login />, { route: '/login' });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Informe um e-mail valido.')).toBeInTheDocument();
    expect(screen.getByText('A senha e obrigatoria.')).toBeInTheDocument();
  });

  it('autentica com credenciais validas e notifica sucesso', async () => {
    renderWithProviders(<Login />, { route: '/login' });
    
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'admin@estoque.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), { 
      target: { value: 'admin123' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(screen.getByText(/Bem-vindo, Administrador/)).toBeInTheDocument(),
    );
  });

  it('notifica erro com credenciais invalidas', async () => {
    renderWithProviders(<Login />, { route: '/login' });
    
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'admin@estoque.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), { 
      target: { value: 'errada' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByText(/inválidos/i)).toBeInTheDocument());
  });
});