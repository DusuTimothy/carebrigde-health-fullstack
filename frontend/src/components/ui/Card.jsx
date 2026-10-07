import React from 'react';
import cn from '../../lib/cn.js';

/**
 * Card with optional title/subtitle and footer. `flush` removes body padding for
 * tables / list rows inside.
 */
export function Card({ flush = false, className, children, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-line bg-surface-raised', !flush && 'p-5', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHead({ title, sub, right, className }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4', className)}>
      <div>
        {title && <h3 className="text-base font-semibold text-ink">{title}</h3>}
        {sub && <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return <div className={cn('border-t border-line px-5 py-3', className)}>{children}</div>;
}