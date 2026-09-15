import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Button from './Button.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/fornecedores', label: 'Fornecedores' },
  { to: '/movimentacoes', label: 'Movimentacoes' },
  { to: '/compras', label: 'Pedidos de Compra' },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  const linkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-accent-600 text-white' : 'text-base-200 hover:bg-base-700 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-base-50">
      {/* Navegacao lateral */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 transform bg-base-900 p-4 transition-transform
                    md:static md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold text-white">Gestao de Estoque</p>
          <p className="text-xs text-base-400">Supply Chain</p>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Backdrop mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-20 bg-base-900/40 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Coluna principal */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-base-200 bg-white px-4 py-3">
          <button
            type="button"
            className="rounded-md p-2 text-base-600 hover:bg-base-100 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            &#9776;
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-base-900">{user?.nome}</p>
              <p className="text-xs text-base-400">{user?.perfil}</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
