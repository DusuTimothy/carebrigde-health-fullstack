import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button.jsx';

export function EmptyState({ title, message, action, children }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-ink-muted">
        <Inbox className="h-6 w-6" />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {message && <p className="max-w-sm text-sm text-ink-secondary">{message}</p>}
      {action && <Button className="mt-2">{action}</Button>}
      {children}
    </div>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      aria-hidden
      className={`rounded-lg bg-neutral-100 ${className ?? 'h-4'}`}
      style={{ background: 'linear-gradient(90deg, var(--color-neutral-100) 25%, var(--color-neutral-200) 50%, var(--color-neutral-100) 75%)', backgroundSize: '200% 100%', animation: 'cb-fade-in 1.4s infinite' }}
    />
  );
}