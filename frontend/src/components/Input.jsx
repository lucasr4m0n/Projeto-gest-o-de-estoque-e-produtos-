import { useId } from 'react';

export default function Input({
  label,
  error,
  type = 'text',
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
      <input
        id={id}
        type={type}
        className="input-field"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
