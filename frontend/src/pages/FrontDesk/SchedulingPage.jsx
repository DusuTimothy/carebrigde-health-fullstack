import React, { useMemo, useState } from 'react';
import { CalendarPlus, UserRound } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Input.jsx';
import { formatDateShort, formatTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { addDays } from '../../lib/format.js';
import cn from '../../lib/cn.js';

const SLOT_LABEL = { 8: '8:00 am', 8.5: '8:30 am', 9: '9:00 am', 9.5: '9:30 am', 10: '10:00 am', 10.5: '10:30 am', 11: '11:00 am', 11.5: '11:30 am', 13: '1:00 pm', 13.5: '1:30 pm', 14: '2:00 pm', 14.5: '2:30 pm', 15: '3:00 pm', 15.5: '3:30 pm', 16: '4:00 pm' };

function SchedulingPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();

  const providers = Object.values(db.providers ?? {});
  const [providerId, setProviderId] = useState(providers[0]?.id ?? '');
  const [dayOffset, setDayOffset] = useState(0);

  const booked = useMemo(
    () =>
      new Set(
        (db.appointments ?? [])
          .filter((a) => a.providerId === providerId)
          .map((a) => {
            const d = new Date(a.date);
            const dayKey = Math.round((new Date(d).setHours(0, 0, 0, 0) - addDays(0).setHours(0, 0, 0, 0)) / 86400000);
            const t = d.getHours() + d.getMinutes() / 60;
            return `${dayKey}:${t}`;
          })
      ),
    [db.appointments, providerId]
  );

  const dayDate = addDays(dayOffset);
  const openSlots = Object.keys(SLOT_LABEL)
    .map((k) => Number(k))
    .filter((t) => !booked.has(`${dayOffset}:${t}`));

  function book(t) {
    const provider = db.providers[providerId];
    const provUser = provider ? db.users[provider.userId] : null;
    const defaultPatientId = Object.keys(db.patients ?? {})[0] ?? db.sessionUserId;
    dbActions.bookAppointment({
      actor: user?.id,
      patientId: defaultPatientId,
      providerId,
      dayOffset,
      slotTime: t,
      type: 'in-person',
      reason: 'Walk-in booking',
    });
    push('Walk-in scheduled', `${provider?.name ?? 'Provider'} booking created on ${formatDateShort(dayDate.toISOString())} at ${SLOT_LABEL[t]}.`, 'success');
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Scheduling</h1>
        <p className="text-sm text-ink-secondary">Find an open slot and book a walk-in patient directly.</p>
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Provider" value={providerId} onChange={(e) => setProviderId(e.target.value)} className="w-72">
            {providers.map((p) => {
              const u = db.users[p.userId];
              return <option key={p.id} value={p.id}>Dr. {u?.lastName} — {p.specialtyName}</option>;
            })}
          </Select>
          <Select label="Day" value={dayOffset} onChange={(e) => setDayOffset(Number(e.target.value))} className="w-44">
            {[0, 1, 2, 3, 4].map((d) => (
              <option key={d} value={d}>{d === 0 ? 'Today' : formatDateShort(addDays(d).toISOString())}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
          <CalendarPlus className="h-5 w-5 text-accent" /> Open slots · {formatDateShort(dayDate.toISOString())}
        </h2>
        {openSlots.length === 0 ? (
          <p className="mt-3 rounded-lg bg-neutral-50 p-4 text-sm text-ink-muted">No open slots this day. Try another provider or date.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {openSlots.map((t) => (
              <button
                key={t}
                onClick={() => book(t)}
                className="flex items-center justify-between rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
              >
                <span>{SLOT_LABEL[t]}</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-ink-muted"><UserRound className="h-3 w-3" /> Walk-in</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <p className="mt-6 flex items-center gap-1.5 rounded-lg bg-neutral-50 p-3 text-xs text-ink-muted">
        In production, booking here would open the registration wizard for a new or returning patient. This demo books Ifeanyi Okafor (second demo patient) into the selected slot.
      </p>
    </div>
  );
}

export default SchedulingPage;