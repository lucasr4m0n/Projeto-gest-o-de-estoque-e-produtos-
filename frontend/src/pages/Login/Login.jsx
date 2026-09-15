import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { isRequired, isValidEmail } from '../../utils/validators.js';

export default function Login() {
  const { signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  function validar() {
    const next = {};
    if (!isValidEmail(email)) next.email = 'Informe um e-mail valido.';
    if (!isRequired(senha)) next.senha = 'A senha e obrigatoria.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    try {
      const usuario = await signIn(email, senha);
      toast.success(`Bem-vindo, ${usuario.nome}.`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Falha na autenticacao.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-900 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-white">Gestao de Estoque e Compras</h1>
          <p className="mt-1 text-sm text-base-400">Acesse com suas credenciais</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6" noValidate>
          <Input
            label="E-mail"
            type="email"
            name="email"
            placeholder="usuario@estoque.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="username"
          />
          <Input
            label="Senha"
            type="password"
            name="senha"
            placeholder="********"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            error={errors.senha}
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-base-500">
          Teste: admin@estoque.com / admin123
        </p>
      </div>
    </div>
  );
}
