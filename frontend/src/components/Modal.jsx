import { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-base-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
          <h2 className="text-base font-semibold text-base-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-base-400 hover:text-base-700"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-base-200 px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
