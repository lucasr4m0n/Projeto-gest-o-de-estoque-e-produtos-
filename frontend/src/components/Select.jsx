import { useId } from 'react';

export default function Select({
  label,
  error,
  options = [],
  placeholder = 'Selecione...',
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const id = rest.id || generatedId;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label-field">
          {label}
        </label>
      )}
      <select
        id={id}
        className="input-field"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
