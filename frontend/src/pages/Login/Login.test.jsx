import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils.jsx';
import Login from './Login.jsx';

beforeEach(() => {
  localStorage.clear();
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
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'admin123' } });
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
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'errada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByText(/invalidas/i)).toBeInTheDocument());
  });
});
