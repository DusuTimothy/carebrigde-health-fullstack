import React, { useId } from 'react';
import cn from '../../lib/cn.js';

/**
 * Input field with label, hint, error and optional leading icon.
 */
export default function Input({
  label,
  id,
  hint,
  error,
  icon: Icon,
  className,
  containerClassName,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className={cn('relative', Icon && '')}>
        {Icon && (
          <Icon aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        )}
        <input
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'w-full rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25',
            error && 'border-danger-ink focus:border-danger-ink focus:ring-danger/25',
            Icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-err`} className="text-xs text-danger-ink">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Select({ label, id, hint, error, className, children, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full appearance-none rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 pr-9 text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25',
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2363615A%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[position:right_0.75rem_center] bg-no-repeat',
          error && 'border-danger-ink',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {hint && <p id={`${inputId}-hint`} className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, id, hint, error, className, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full min-h-24 resize-y rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25',
          error && 'border-danger-ink',
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger-ink">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Fieldset({ legend, children, className }) {
  return (
    <fieldset className={cn('space-y-4', className)}>
      {legend && <legend className="text-sm font-semibold text-ink">{legend}</legend>}
      {children}
    </fieldset>
  );
}

export function Checkbox({ label, hint, className, ...props }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-2 text-sm text-ink-secondary', className)}>
      <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] accent-accent" {...props} />
      <span>
        {label}
        {hint && <span className="block text-xs text-ink-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function Radio({ label, hint, className, ...props }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-2 text-sm text-ink-secondary', className)}>
      <input type="radio" className="mt-0.5 h-[18px] w-[18px] accent-accent" {...props} />
      <span>
        {label}
        {hint && <span className="block text-xs text-ink-muted">{hint}</span>}
      </span>
    </label>
  );
}