import Spinner from './Spinner.jsx';

const VARIANTS = {
  primary: 'bg-accent-600 text-white hover:bg-accent-700 border-transparent',
  secondary: 'bg-white text-base-800 hover:bg-base-50 border-base-300',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 border-transparent',
  ghost: 'bg-transparent text-base-700 hover:bg-base-100 border-transparent',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2
                  text-sm font-medium transition-colors disabled:cursor-not-allowed
                  disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
