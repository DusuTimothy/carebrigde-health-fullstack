import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import cn from '../../lib/cn.js';

/**
 * Multi-step wizard stepper. `steps` = [{id,label}], `current` index.
 */
export function Stepper({ steps, current, onStep }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.id} className="flex items-center gap-2 whitespace-nowrap">
            {i > 0 && (
              <span aria-hidden className={cn('h-px w-6', done ? 'bg-teal' : 'bg-line-strong')} />
            )}
            <button
              type="button"
              onClick={() => onStep?.(i)}
              disabled={i > current}
              aria-current={active ? 'step' : undefined}
              className="flex items-center gap-2 disabled:cursor-not-allowed"
            >
              <span
                aria-hidden
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
                  done && 'border-teal bg-teal text-teal-deep',
                  active && 'border-accent bg-accent text-white',
                  !done && !active && 'border-line-strong bg-neutral-100 text-ink-muted'
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  active ? 'text-ink' : done ? 'text-ink-secondary' : 'text-ink-muted'
                )}
              >
                {step.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function Pagination({ page, pageCount, total, onPage, pageSize }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-4 text-sm text-ink-muted">
      <span>
        Showing{' '}
        <strong className="text-ink">
          {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
        </strong>{' '}
        of <strong className="text-ink">{total}</strong>
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-8 items-center gap-1 rounded-lg border border-line px-3 text-xs font-medium text-ink-secondary hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="flex h-8 items-center gap-1 rounded-lg border border-line px-3 text-xs font-medium text-ink-secondary hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}