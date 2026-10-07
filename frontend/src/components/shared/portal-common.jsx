import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';
import cn from '../../lib/cn.js';
import Pill from '../ui/Pill.jsx';

/* ---------- Section heading ---------- */
export function SectionHead({ title, sub, action, actionTo }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">{title}</h2>
        {sub && <p className="mt-1 max-w-[52ch] text-sm text-ink-secondary">{sub}</p>}
      </div>
      {action && (
        <Link to={actionTo} className="inline-flex items-center gap-0.5 text-sm font-semibold text-accent hover:text-accent-deep">
          {action} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/* ---------- Summary card (dashboards) ---------- */
const SC_ICON_TONES = {
  blue: 'bg-accent-soft text-accent',
  teal: 'bg-teal-soft text-teal-deep',
  amber: 'bg-warning-soft text-warning-ink',
  red: 'bg-danger-soft text-danger-ink',
  gray: 'bg-neutral-100 text-ink-secondary',
};

export function SummaryCard({ icon: Icon, label, value, hint, tone = 'blue', to }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span aria-hidden className={cn('flex h-10 w-10 items-center justify-center rounded-lg', SC_ICON_TONES[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <Pill tone="neutral" className="!px-2 !py-0.5 text-[10px] uppercase tracking-wide">{label}</Pill>
      </div>
      <p className="text-3xl font-bold tracking-tight text-ink">{value}</p>
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </>
  );
  if (to) {
    return (
      <Link to={to} className="group flex flex-col gap-2 rounded-xl border border-line bg-surface-raised p-4 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md">
        {inner}
      </Link>
    );
  }
  return <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-raised p-4">{inner}</div>;
}

/* ---------- Result/status pill ---------- */
export function StatusPill({ status }) {
  const map = {
    scheduled: { tone: 'info', label: 'Scheduled' },
    confirmed: { tone: 'info', label: 'Confirmed' },
    open: { tone: 'neutral', label: 'Available' },
    checkin: { tone: 'warning', label: 'Checked in' },
    waiting: { tone: 'warning', label: 'Waiting' },
    in_room: { tone: 'brand', label: 'In room' },
    completed: { tone: 'success', label: 'Completed' },
    cancelled: { tone: 'danger', label: 'Cancelled' },
    paid: { tone: 'success', label: 'Paid' },
    submitted: { tone: 'info', label: 'Submitted' },
    pending: { tone: 'warning', label: 'Pending' },
    denied: { tone: 'danger', label: 'Denied' },
    active: { tone: 'success', label: 'Active' },
    expired: { tone: 'neutral', label: 'Expired' },
    'refill-pending': { tone: 'warning', label: 'Refill pending' },
    final: { tone: 'success', label: 'Final' },
    flagged: { tone: 'danger', label: 'Flagged' },
    normal: { tone: 'success', label: 'Normal' },
    above: { tone: 'danger', label: 'Above range' },
    below: { tone: 'warning', label: 'Below range' },
    recruiting: { tone: 'success', label: 'Recruiting' },
    not_recruiting: { tone: 'neutral', label: 'Not recruiting' },
    pending_collection: { tone: 'warning', label: 'Awaiting collection' },
    in_progress: { tone: 'brand', label: 'In progress' },
    resulted: { tone: 'info', label: 'Resulted' },
    ready_dispatch: { tone: 'info', label: 'Ready' },
    fulfilled: { tone: 'success', label: 'Fulfilled' },
    placed: { tone: 'warning', label: 'Placed' },
    processing: { tone: 'brand', label: 'Processing' },
    ready: { tone: 'info', label: 'Ready' },
    admitted: { tone: 'success', label: 'Admitted' },
    transferred: { tone: 'info', label: 'Transferred' },
    discharged: { tone: 'neutral', label: 'Discharged' },
    available: { tone: 'success', label: 'Available' },
    occupied: { tone: 'brand', label: 'Occupied' },
    reserved: { tone: 'warning', label: 'Reserved' },
    maintenance: { tone: 'neutral', label: 'Maintenance' },
    inactive: { tone: 'neutral', label: 'Inactive' },
    discontinued: { tone: 'neutral', label: 'Discontinued' },
    low_stock: { tone: 'warning', label: 'Low stock' },
    out_of_stock: { tone: 'danger', label: 'Out of stock' },
  };
  const m = map[status] ?? { tone: 'neutral', label: status };
  return (
    <Pill tone={m.tone} dot>
      {m.label}
    </Pill>
  );
}

/* ---------- Row in a list (activity / messages / queue) ---------- */
export function ListRow({ icon: Icon, iconTone = 'gray', title, sub, right, to, onClick }) {
  const cls = cn(
    'flex items-center gap-3 border-b border-line px-5 py-4 text-left transition-colors',
    onClick || to ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-default'
  );
  const body = (
    <>
      {Icon && (
        <span aria-hidden className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', SC_ICON_TONES[iconTone])}>
          <Icon className="h-4 w-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{title}</span>
        {sub && <span className="block truncate text-xs text-ink-muted">{sub}</span>}
      </span>
      {right && <span className="shrink-0">{right}</span>}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

/* ---------- Star rating ---------- */
export function Rating({ value, count }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-warning-ink">
      <Star className="h-3.5 w-3.5 fill-warning-solid text-warning-solid" aria-hidden />
      {value}
      {count && <span className="font-normal text-ink-muted">({count})</span>}
    </span>
  );
}

/* ---------- Icon tile for public cards ---------- */
export function IconTile({ icon: Icon, tone = 'blue', className }) {
  return (
    <span aria-hidden className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', SC_ICON_TONES[tone], className)}>
      <Icon className="h-5 w-5" />
    </span>
  );
}