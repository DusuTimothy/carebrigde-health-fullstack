import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, FlaskConical, MessageSquare, CalendarClock, CreditCard, PillIcon, FileBarChart, Inbox } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Pagination } from '../../components/ui/Stepper.jsx';
import { timeAgo } from '../../lib/format.js';
import cn from '../../lib/cn.js';

const TYPE_ICON = {
  lab: FlaskConical,
  message: MessageSquare,
  appointment: CalendarClock,
  billing: CreditCard,
  prescription: PillIcon,
  results: FlaskConical,
  report: FileBarChart,
  queue: Bell,
  schedule: CalendarClock,
};

function NotificationsPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);

  const mine = useMemo(
    () => (db.notifications ?? []).filter((n) => n.userId === user?.id).sort((a, b) => new Date(b.at) - new Date(a.at)),
    [db.notifications, user]
  );
  const unread = mine.filter((n) => !n.read).length;

  const PAGE_SIZE = 10;
  const pageCount = Math.max(1, Math.ceil(mine.length / PAGE_SIZE));
  const rows = mine.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Notifications</h1>
          <p className="text-sm text-ink-secondary">{unread > 0 ? `${unread} unread updates` : 'You are all caught up.'}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={() => dbActions.markAllNotificationsRead({ userId: user?.id })}>
            Mark all as read
          </Button>
        )}
      </div>

      <Card flush className="mt-6">
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Inbox className="h-8 w-8 text-ink-muted" />
            <p className="text-sm text-ink-muted">No notifications yet. We will let you know when something needs your attention.</p>
          </div>
        )}
        {rows.map((n) => {
          const Icon = TYPE_ICON[n.type] ?? Bell;
          return (
            <button
              key={n.id}
              onClick={() => {
                if (!n.read) dbActions.markNotificationRead({ userId: user?.id, id: n.id });
                if (n.link) navigate(n.link);
              }}
              className={cn(
                'flex w-full items-start gap-3 border-b border-line px-5 py-4 text-left transition-colors hover:bg-neutral-50',
                !n.read && 'bg-accent-soft/50'
              )}
            >
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', n.read ? 'bg-neutral-100 text-ink-muted' : 'bg-accent text-white')}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">{n.title}</span>
                  <span className="shrink-0 text-[11px] text-ink-muted">{timeAgo(n.at)}</span>
                </span>
                <span className="mt-0.5 block text-sm text-ink-secondary">{n.body}</span>
                {n.link && <span className="mt-1 block text-xs font-medium text-accent">Open via {n.link.split('?')[0]}</span>}
              </span>
              {!n.read && <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
            </button>
          );
        })}
      </Card>

      {mine.length > PAGE_SIZE && (
        <div className="mt-4 rounded-xl border border-line bg-surface-raised">
          <Pagination page={page} pageCount={pageCount} total={mine.length} onPage={setPage} pageSize={PAGE_SIZE} />
        </div>
      )}

      <p className="mt-6 text-xs text-ink-muted">
        Notifications appear in your portal across devices and are sent to the email on file.
        <Link to="/portal/settings" className="ml-1 font-semibold text-accent hover:underline">Manage preferences</Link>.
      </p>
    </div>
  );
}

export default NotificationsPage;