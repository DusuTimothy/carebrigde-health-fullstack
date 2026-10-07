/* Date / number formatting helpers (deterministic, no external deps) */

const TZ = 'Africa/Lagos';

export function addDays(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toISO(date = new Date()) {
  return date.toISOString();
}

export function formatDate(input) {
  if (!input) return '—';
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: TZ });
}

export function formatDateShort(input) {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: TZ });
}

export function formatTime(input) {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
}

export function formatDateTime(input) {
  const d = typeof input === 'string' ? new Date(input) : input;
  return `${formatDate(d)} at ${formatTime(d)}`;
}

export function formatTimeHM(d) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ }).format(d);
}

/* A numeric booking slot (e.g. 9.5) -> "09:30", for composing ISO date strings. */
export function slotTimeToString(t) {
  const hour = Math.floor(t);
  const minute = Math.round((t % 1) * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

export function formatDayName(input) {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: TZ });
}

export function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function relativeFromNow(input, { future = 'in {n}' } = {}) {
  const target = typeof input === 'string' ? new Date(input) : input;
  const now = new Date();
  const diffDays = Math.round((startOfDay(target).getTime() - startOfDay(now).getTime()) / 86400000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  if (diffDays > 7) return formatDateShort(target);
  if (diffDays < -7) return formatDateShort(target);
  return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)}d ago`;
}

export function timeAgo(input) {
  if (!input) return '—';
  const d = typeof input === 'string' ? new Date(input) : input;
  const seconds = Math.floor((new Date() - d) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* Deterministic pseudo-random (seeded) so mock data is stable across reloads */
export function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}