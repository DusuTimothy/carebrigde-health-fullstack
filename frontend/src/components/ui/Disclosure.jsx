import React from 'react';
import cn from '../../lib/cn.js';

/**
 * Accessible tabs (roving tabs). Provide `tabs=[{id,label}]` and
 * `active`/`onChange`.
 */
export function Tabs({ tabs, active, onChange, ariaLabel, className }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex gap-1 overflow-x-auto border-b border-line no-scrollbar', className)}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange?.(tab.id)}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              selected
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, children, className }) {
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className={cn('pt-5', className)}>
      {children}
    </div>
  );
}

export function Accordion({ items }) {
  const [openId, setOpenId] = React.useState(items[0]?.id ?? null);
  return (
    <div>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            data-open={open ? 'true' : 'false'}
            className="mb-3 overflow-hidden rounded-lg border border-line bg-surface-raised"
          >
            <button
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-ink hover:text-accent"
            >
              {item.summary}
              <svg
                aria-hidden
                className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open && (
              <div className="px-5 pb-4 text-sm text-ink-secondary">{item.details}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}