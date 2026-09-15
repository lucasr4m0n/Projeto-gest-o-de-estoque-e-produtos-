import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Layout from '../components/Layout.jsx';
import Login from '../pages/Login/Login.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Produtos from '../pages/Produtos/Produtos.jsx';
import Categorias from '../pages/Categorias/Categorias.jsx';
import Fornecedores from '../pages/Fornecedores/Fornecedores.jsx';
import Movimentacoes from '../pages/Movimentacoes/Movimentacoes.jsx';
import Compras from '../pages/Compras/Compras.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota publica */}
      <Route path="/login" element={<Login />} />

      {/* Rotas privadas sob o Layout autenticado */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/movimentacoes" element={<Movimentacoes />} />
        <Route path="/compras" element={<Compras />} />
      </Route>

      {/* Redirecionamentos */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
