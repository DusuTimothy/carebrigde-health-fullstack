import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, FlaskConical, MessageSquare, UserRound, ArrowRight } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import { SummaryCard, StatusPill } from '../../components/shared/portal-common.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { timeAgo, formatTime, formatDayName } from '../../lib/format.js';

export function MyAppointments({ compact = false }) {
  const [db] = useDB();
  const { user } = useAuth();
  const me = (db.providers ?? {})[Object.keys(db.providers ?? {}).find((id) => db.providers[id].userId === user?.id)];
  const appts = useMemo(
    () =>
      (db.appointments ?? [])
        .filter((a) => a.providerId === me?.id && ['scheduled', 'checkin', 'in_room'].includes(a.status))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, compact ? 4 : 8),
    [db.appointments, me]
  );
  if (!appts.length) return <p className="px-5 py-6 text-sm text-ink-muted">No upcoming appointments.</p>;
  return (
    <div className="divide-y divide-line">
      {appts.map((a) => {
        const p = db.patients[a.patientId];
        const video = a.type === 'video';
        return (
          <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
            <Avatar name={p ? `${p.firstName} ${p.lastName}` : 'Walk-in'} size="sm" tone={video ? 'teal' : 'primary'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{p ? `${p.firstName} ${p.lastName}` : 'Walk-in patient'}</p>
              <p className="text-xs text-ink-muted">
                {formatDayName(a.date)} {formatTime(a.date)} · {video ? 'Video' : a.room === 'To be assigned' ? a.location ?? 'In person' : a.room}
              </p>
            </div>
            <StatusPill status={a.status} />
          </div>
        );
      })}
    </div>
  );
}

function DashboardPage() {
  const [db] = useDB();
  const { user } = useAuth();
  const me = (db.providers ?? {})[Object.keys(db.providers ?? {}).find((id) => db.providers[id].userId === user?.id)];

  const todayCount = useMemo(
    () => (db.appointments ?? []).filter((a) => a.providerId === me?.id && ['scheduled', 'checkin', 'in_room'].includes(a.status)).length,
    [db.appointments, me]
  );
  const pendingResults = (db.labResults ?? []).filter((r) => !r.signedOff).length;
  const unreadMessages = (db.threads ?? []).filter((t) => t.participants.includes(user?.id) && t.unreadCount > 0).length;
  const pendingOrders = (db.labOrders ?? []).filter((o) => o.providerId === me?.id && !['resulted', 'pending_collection'].includes(o.status)).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back, Dr. {user?.lastName}</h1>
          <p className="text-sm text-ink-secondary">{user?.email} · {me?.specialtyName}</p>
        </div>
        <Link to="/portal/provider/schedule" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
          Open schedule <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={CalendarClock} label="Today" value={todayCount} hint="appointments today" tone="blue" />
        <SummaryCard icon={MessageSquare} label="Inbox" value={unreadMessages} hint="unread messages" tone="teal" />
        <SummaryCard icon={FlaskConical} label="Results" value={pendingResults} hint="awaiting sign-off" tone="amber" />
        <SummaryCard icon={UserRound} label="Patients" value={(db.patients ? Object.keys(db.patients) : []).length} hint="on your panel in demo" tone="gray" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card flush>
          <CardHead
            title="Upcoming appointments"
            right={<Link to="/portal/provider/schedule" className="text-xs font-semibold text-accent hover:underline">View schedule</Link>}
          />
          <MyAppointments compact />
        </Card>
        <Card>
          <CardHead title="This week" />
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Appointments</span><span className="font-semibold text-ink">{todayCount + 6}</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Video visits</span><span className="font-semibold text-ink">{todayCount}</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Open slots</span><span className="font-semibold text-ink">{pendingOrders + 12}</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Pending lab orders</span><span className="font-semibold text-ink">{pendingOrders}</span></li>
          </ul>
          <p className="mt-4 rounded-lg bg-accent-soft p-3 text-xs text-accent">
            {unreadMessages > 0 ? `You have ${unreadMessages} unread message${unreadMessages === 1 ? '' : 's'} waiting.` : 'You are all caught up on messages.'} Last activity {timeAgo(db.auditLog?.[0]?.at)}.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;