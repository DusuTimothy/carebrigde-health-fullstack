import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import Input from './Input.jsx';
import cn from '../../lib/cn.js';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const ICON_BTN =
  'flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-accent-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50';
const SELECT =
  'rounded-lg border border-line bg-surface-raised px-1.5 py-1 text-sm font-medium text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25';

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseISO(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(value) {
  const date = parseISO(value);
  if (!date) return '';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Date field with a custom, themeable calendar popover (native date pickers
 * can't be styled). Emits a change event shaped like a native input so callers
 * keep using `onChange={(e) => ...e.target.value}`.
 */
export default function DateInput({
  label = 'Date',
  id,
  value = '',
  onChange,
  min,
  max,
  name,
  className,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseISO(value) ?? new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    const next = parseISO(value);
    if (next) setViewDate(next);
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayISO = toISO(new Date());
  const minISO = min || '';
  const maxISO = max || '';
  const isDisabled = (iso) => (minISO && iso < minISO) || (maxISO && iso > maxISO);

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < firstWeekday; i += 1) out.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) out.push(d);
    return out;
  }, [year, month]);

  const yearOptions = useMemo(() => {
    const start = minISO ? Number(minISO.slice(0, 4)) : year - 100;
    const end = maxISO ? Number(maxISO.slice(0, 4)) : year + 10;
    const list = [];
    for (let y = end; y >= start; y -= 1) list.push(y);
    return list;
  }, [minISO, maxISO, year]);

  function select(day) {
    onChange?.({ target: { value: toISO(new Date(year, month, day)), name } });
    setOpen(false);
  }

  function selectToday() {
    const now = new Date();
    onChange?.({ target: { value: toISO(now), name } });
    setViewDate(now);
    setOpen(false);
  }

  function shiftMonth(delta) {
    setViewDate(new Date(year, month + delta, 1));
  }

  return (
    <div className="relative" ref={containerRef}>
      <Input
        id={inputId}
        label={label}
        icon={CalendarDays}
        readOnly
        value={formatDisplay(value)}
        placeholder="Select a date"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn('cursor-pointer', className)}
        trailing={
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? 'Close date picker' : 'Open date picker'}
            className={ICON_BTN}
          >
            <CalendarDays aria-hidden className="h-4 w-4" />
          </button>
        }
        {...props}
      />

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute bottom-full left-0 z-50 mb-2 w-[19rem] rounded-xl border border-line bg-surface-raised p-3 shadow-xl"
        >
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className={ICON_BTN}>
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <select
                aria-label="Month"
                value={month}
                onChange={(e) => setViewDate(new Date(year, Number(e.target.value), 1))}
                className={SELECT}
              >
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select
                aria-label="Year"
                value={year}
                onChange={(e) => setViewDate(new Date(Number(e.target.value), month, 1))}
                className={SELECT}
              >
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className={ICON_BTN}>
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{w}</span>
            ))}
            {cells.map((day, i) => {
              if (!day) return <span key={`empty-${i}`} />;
              const iso = toISO(new Date(year, month, day));
              const selected = iso === value;
              const disabled = isDisabled(iso);
              const isToday = iso === todayISO;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => select(day)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                    disabled && 'cursor-not-allowed text-ink-muted/40',
                    !disabled && !selected && 'text-ink hover:bg-accent-soft hover:text-accent',
                    selected && 'bg-accent font-semibold text-white',
                    !selected && isToday && 'ring-1 ring-inset ring-accent/40'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <button
              type="button"
              disabled={isDisabled(todayISO)}
              onClick={selectToday}
              className="rounded-lg px-2 py-1 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:text-ink-muted/40"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
