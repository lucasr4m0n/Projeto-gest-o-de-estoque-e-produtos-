import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider } from './ToastContext.jsx';
import { useToast } from '../hooks/useToast.js';

function Consumer() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Sucesso!')}>sucesso</button>
      <button onClick={() => toast.error('Erro!')}>erro</button>
    </div>
  );
}

function setup() {
  return render(
    <ToastProvider>
      <Consumer />
    </ToastProvider>,
  );
}

describe('ToastContext', () => {
  it('exibe uma notificacao de sucesso', () => {
    setup();
    fireEvent.click(screen.getByText('sucesso'));
    expect(screen.getByRole('alert')).toHaveTextContent('Sucesso!');
  });

  it('remove a notificacao ao fechar', () => {
    setup();
    fireEvent.click(screen.getByText('erro'));
    expect(screen.getByRole('alert')).toHaveTextContent('Erro!');
    fireEvent.click(screen.getByLabelText('Fechar notificacao'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('remove automaticamente apos o tempo definido', async () => {
    jest.useFakeTimers();
    setup();
    act(() => {
      fireEvent.click(screen.getByText('sucesso'));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    jest.useRealTimers();
  });
});
