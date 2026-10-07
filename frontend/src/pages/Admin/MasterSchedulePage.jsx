import React from 'react';
import { CalendarDays } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { Card } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { formatTime, formatDate } from '../../lib/format.js';
import cn from '../../lib/cn.js';
function MasterSchedulePage() {
  const [db] = useDB();

  const appts = [...(db.appointments ?? [])].sort((a, b) => new Date(a.date) - new Date(b.date));

  const days = [...new Set(appts.map((a) => new Date(a.date).toDateString()))].slice(0, 5);
  const openCount = appts.filter((a) => a.status === 'open').length;
  const scheduledCount = appts.filter((a) => ['scheduled', 'checkin', 'in_room'].includes(a.status)).length;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Master schedule</h1>
        <p className="text-sm text-ink-secondary">All appointments across providers and locations for the next several days.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:max-w-md">
        <Card className="p-4">
          <p className="text-xs text-ink-muted">Open slots</p>
          <p className="mt-0.5 text-2xl font-bold text-ink">{openCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-muted">Booked</p>
          <p className="mt-0.5 text-2xl font-bold text-ink">{scheduledCount}</p>
        </Card>
      </div>

      <div className="mt-6 space-y-6">
        {days.map((key) => {
          const dayAppts = appts.filter((a) => new Date(a.date).toDateString() === key);
          return (
            <div key={key}>
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-accent" />
                <h2 className="text-base font-semibold text-ink">{formatDate(new Date(key).toISOString())}</h2>
                <span className="text-xs text-ink-muted">({dayAppts.length} appointments)</span>
              </div>
              <div className="grid gap-2 lg:grid-cols-2">
                {dayAppts.map((a) => {
                  const prov = db.providers[a.providerId];
                  const provUser = prov ? db.users[prov.userId] : null;
                  const p = db.patients[a.patientId];
                  return (
                    <div key={a.id} className={cn('flex items-center gap-3 rounded-xl border border-line bg-surface-raised px-4 py-3')}>
                      <div className="flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-accent-soft text-accent">
                        <span className="text-sm font-bold leading-none">{formatTime(a.date)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {p ? `${p.firstName} ${p.lastName}` : 'Open slot'} · {a.type === 'video' ? 'Video' : a.reason ?? 'Open'}
                        </p>
                        <p className="text-xs text-ink-muted">
                          Dr. {provUser?.lastName} · {prov?.location} · {a.room}
                        </p>
                      </div>
                      <StatusPill status={a.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MasterSchedulePage;
