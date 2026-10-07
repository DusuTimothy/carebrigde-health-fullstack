import React from 'react';
import cn from '../../lib/cn.js';

/**
 * Data table. `columns` = [{ key, header, className, render }].
 */
export default function Table({ columns, rows, rowKey = 'id', onRowClick, empty, className }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface-raised">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-neutral-100 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-muted">
                {empty ?? 'No results.'}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={row[rowKey] ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-t border-line transition-colors',
                onRowClick && 'cursor-pointer hover:bg-accent-soft'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 align-middle text-ink', col.className)}>
                  {col.render ? col.render(row, i) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}