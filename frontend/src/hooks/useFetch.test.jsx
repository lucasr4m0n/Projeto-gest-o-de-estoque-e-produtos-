import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch.js';

function Consumer({ fn }) {
  const { data, loading, error, refetch } = useFetch(fn, []);
  return (
    <div>
      {loading && <span>carregando</span>}
      {error && <span>erro: {error.message}</span>}
      {data && <span>dados: {data}</span>}
      <button onClick={refetch}>recarregar</button>
    </div>
  );
}

describe('useFetch', () => {
  it('resolve dados com sucesso', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    render(<Consumer fn={fn} />);
    expect(screen.getByText('carregando')).toBeInTheDocument();
    expect(await screen.findByText('dados: ok')).toBeInTheDocument();
  });

  it('captura erros', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('falhou'));
    render(<Consumer fn={fn} />);
    expect(await screen.findByText('erro: falhou')).toBeInTheDocument();
  });

  it('notifica o consumidor quando a carga falha', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('falhou'));
    const onError = jest.fn();

    function ErrorConsumer() {
      const { error } = useFetch(fn, [], { onError });
      return error ? <span>{error.message}</span> : null;
    }

    render(<ErrorConsumer />);
    expect(await screen.findByText('falhou')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('reexecuta ao chamar refetch', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    render(<Consumer fn={fn} />);
    await screen.findByText('dados: ok');
    fireEvent.click(screen.getByText('recarregar'));
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(2));
  });
});
