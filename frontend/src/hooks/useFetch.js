import { useCallback, useEffect, useState } from 'react';

/**
 * Executa uma funcao assincrona, controlando estados de carregamento e erro.
 * @param {Function} asyncFn funcao que retorna uma Promise
 * @param {Array} deps dependencias que disparam nova execucao
 * @param {{onError?: Function}} options callback opcional para falha da carga automatica
 */
export function useFetch(asyncFn, deps = [], options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async (notifyError = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      if (notifyError) options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
    // As dependencias sao controladas pelo consumidor do hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(() => execute(false), [execute]);

  useEffect(() => {
    // O erro ja e refletido no estado e, quando configurado, notificado por onError.
    // A rejeicao e consumida para evitar unhandled rejection no ciclo do efeito.
    execute(true).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch, setData };
}
