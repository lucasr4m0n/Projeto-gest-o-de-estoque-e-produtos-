import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext.jsx';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider.');
  }
  return context;
}
