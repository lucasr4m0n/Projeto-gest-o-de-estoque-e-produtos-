import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-base-50 p-4 text-center">
      <p className="text-4xl font-semibold text-base-900">404</p>
      <p className="text-base-500">A pagina solicitada nao foi encontrada.</p>
      <Link to="/dashboard" className="text-sm font-medium text-accent-700 hover:underline">
        Voltar ao dashboard
      </Link>
    </div>
  );
}
