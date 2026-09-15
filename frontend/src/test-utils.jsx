/* eslint-disable react-refresh/only-export-components */
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

// Renderiza um componente dentro dos provedores globais e do roteador.
export function renderWithProviders(ui, { route = '/', ...options } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthProvider>{ui}</AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
    options,
  );
}

export * from '@testing-library/react';
