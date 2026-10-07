import React, { useMemo, useState } from 'react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatTime, formatDateShort, startOfDay, addDays } from '../../lib/format.js';
import cn from '../../lib/cn.js';

function slotLabel(t) {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return formatTime(date);
}

function SchedulePage() {
  const [db] = useDB();
  const { user } = useAuth();
  const [dayOffset, setDayOffset] = useState(0);

  const me = (db.providers ?? {})[Object.keys(db.providers ?? {}).find((id) => db.providers[id].userId === user?.id)];

  const appts = useMemo(
    () =>
      (db.appointments ?? [])
        .filter((a) => a.providerId === me?.id)
        .filter((a) => startOfDay(new Date(a.date)).getTime() === startOfDay(addDays(dayOffset)).getTime())
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [db.appointments, me, dayOffset]
  );

  const dayStart = startOfDay(addDays(dayOffset));
  const dayLabel = formatDateShort(dayStart);

  const openSlots = useMemo(() => {
    const booked = new Set(appts.map((a) => new Date(a.date).getHours() + new Date(a.date).getMinutes() / 60));
    const times = [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 13, 13.5, 14, 14.5, 15, 15.5, 16];
    return times.filter((t) => !booked.has(t));
  }, [appts]);

  const rows = [];
  for (const t of [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 13, 13.5, 14, 14.5, 15, 15.5, 16]) {
    const appt = appts.find((a) => new Date(a.date).getHours() + new Date(a.date).getMinutes() / 60 === t);
    rows.push({ t, appt });
  }

  const navBtn =
    'rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-40';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Schedule</h1>
          <p className="text-sm text-ink-secondary">Dr. {user?.lastName} · {me?.specialtyName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className={navBtn} disabled={dayOffset <= -7} onClick={() => setDayOffset((d) => d - 1)}>← Earlier</button>
          <button className={navBtn} disabled={dayOffset >= 7} onClick={() => setDayOffset((d) => d + 1)}>Later →</button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-sm">
        <div className="flex items-center justify-between bg-navy-radial px-5 py-3 text-white">
          <p className="font-semibold">{dayLabel}</p>
          <p className="text-xs text-white/70">{appts.filter((a) => a.patientId).length} scheduled · {openSlots.length} open</p>
        </div>
        <div className="divide-y divide-line">
          {rows.map(({ t, appt }) => {
            const p = appt?.patientId ? db.patients[appt.patientId] : null;
            const video = appt?.type === 'video';
            return (
              <div key={t} className={cn('flex items-center gap-4 px-5 py-2.5 text-sm', !appt && 'bg-neutral-50/50')}>
                <span className="w-24 shrink-0 font-mono text-xs text-ink-muted">{slotLabel(t)}</span>
                {appt ? (
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={p ? `${p.firstName} ${p.lastName}` : 'Walk-in'} size="sm" tone={video ? 'teal' : 'primary'} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{p ? `${p.firstName} ${p.lastName}` : 'Assigned patient'} {video && <span className="rounded bg-teal-soft px-1.5 py-0.5 text-[10px] font-bold text-teal-deep">Video</span>}</p>
                      <p className="text-xs text-ink-muted">{appt.reason ?? '—'} · {appt.room === 'To be assigned' ? 'Room TBA' : appt.room}</p>
                    </div>
                    <StatusPill status={appt.status} />
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="h-2 w-2 rounded-full border border-line-strong" /> Open slot — available for booking
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-muted">
        {openSlots.length > 0
          ? `${openSlots.length} open slots remain — patients can book these online via the public site.`
          : 'This day is fully booked.'}
      </p>
    </div>
  );
}

export default SchedulePage;