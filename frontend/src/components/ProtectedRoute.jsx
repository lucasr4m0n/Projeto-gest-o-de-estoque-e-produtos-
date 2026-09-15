import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Spinner from './Spinner.jsx';

/**
 * Envolve rotas privadas. Redireciona para /login quando nao ha sessao valida.
 * Suporta restricao por perfil via a prop `perfis`.
 */
export default function ProtectedRoute({ children, perfis }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (perfis && perfis.length > 0 && !perfis.includes(user?.perfil)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
