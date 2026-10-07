import React from 'react';
import cn from '../../lib/cn.js';

/**
 * Status pill. State is always conveyed via color + icon dot + label together.
 */
const tones = {
  neutral: 'bg-neutral-100 text-ink-secondary border-neutral-200',
  success: 'bg-success-soft text-success-ink border-success-border',
  warning: 'bg-warning-soft text-warning-ink border-warning-border',
  danger: 'bg-danger-soft text-danger-ink border-danger-border',
  info: 'bg-info-soft text-info-ink border-info-border',
  brand: 'bg-accent-soft text-accent border-primary-200',
};

export default function Pill({ tone = 'neutral', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className
      )}
    >
      {dot && <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full bg-current')} />}
      {children}
    </span>
  );
}