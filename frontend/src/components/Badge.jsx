const TONES = {
  neutral: 'bg-base-100 text-base-700',
  success: 'bg-accent-50 text-accent-700',
  danger: 'bg-danger-50 text-danger-700',
  warn: 'bg-warn-50 text-warn-600',
};

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
