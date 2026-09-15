import { createContext, useCallback, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      idSeq += 1;
      const id = idSeq;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success: (msg) => addToast(msg, 'success'),
      error: (msg) => addToast(msg, 'error'),
      info: (msg) => addToast(msg, 'info'),
    }),
    [toasts, addToast, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onClose }) {
  const styles = {
    success: 'border-accent-500 bg-accent-50 text-accent-700',
    error: 'border-danger-500 bg-danger-50 text-danger-700',
    info: 'border-base-300 bg-white text-base-800',
  };
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notificacoes"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`flex items-start justify-between gap-3 rounded-md border-l-4 px-4 py-3 text-sm shadow-card ${styles[t.type] || styles.info}`}
        >
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => onClose(t.id)}
            className="text-base-400 hover:text-base-700"
            aria-label="Fechar notificacao"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

export { ToastContext };
