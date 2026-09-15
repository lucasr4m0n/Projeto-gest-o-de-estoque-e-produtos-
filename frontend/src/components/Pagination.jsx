import Button from './Button.jsx';

/**
 * Controles simples de paginacao para listas no cliente.
 */
export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems <= 0) return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-base-500">
      <span>
        Exibindo {firstItem}-{lastItem} de {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Pagina anterior"
        >
          Anterior
        </Button>
        <span className="min-w-24 text-center">
          Pagina {page} de {totalPages}
        </span>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Proxima pagina"
        >
          Proxima
        </Button>
      </div>
    </div>
  );
}
