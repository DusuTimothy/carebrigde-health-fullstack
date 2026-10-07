import React from 'react';
import { Activity, PillIcon, UserRound, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import { SummaryCard } from '../../components/shared/portal-common.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { formatTime } from '../../lib/format.js';

function NurseDashboardPage() {
  const [db] = useDB();
  const { user } = useAuth();

  const queue = (db.checkins ?? []).filter((c) => ['waiting', 'in_room'].includes(c.status));
  const waiting = queue.filter((c) => c.status === 'waiting');
  const pendingVitals = queue.filter((c) => !c.vitals);
  const todayAppts = (db.appointments ?? []).filter((a) => ['scheduled', 'checkin', 'in_room'].includes(a.status)).length;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome, {user?.firstName}</h1>
        <p className="text-sm text-ink-secondary">Day shift · Carebridge Medical Centre, Ikeja</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={ClipboardList} label="Waiting" value={waiting.length} hint="patients checked in, not in room" tone="amber" />
        <SummaryCard icon={UserRound} label="In queue" value={queue.length} hint="waiting + in room" tone="blue" />
        <SummaryCard icon={Activity} label="Vitals due" value={pendingVitals.length} hint="triage to complete" tone="teal" />
        <SummaryCard icon={PillIcon} label="Visits today" value={todayAppts} hint="across all providers" tone="gray" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card flush>
          <CardHead
            title="Check-in queue"
            right={<Link to="/portal/nurse/queue" className="text-xs font-semibold text-accent hover:underline">Triage next →</Link>}
          />
          <div className="divide-y divide-line">
            {queue.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={c.name} size="sm" tone={c.status === 'in_room' ? 'primary' : 'teal'} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-muted">{c.reason} · arrived {formatTime(c.arrivedAt)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${c.status === 'in_room' ? 'bg-accent-soft text-accent' : 'bg-warning-soft text-warning-ink'}`}>
                  {c.status === 'in_room' ? 'In room' : 'Waiting'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Today's snapshot" />
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Appointments booked</span><span className="font-semibold text-ink">{todayAppts}</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Vitals completed</span><span className="font-semibold text-ink">{(db.checkins ?? []).filter((c) => c.vitals).length}</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Open rooms</span><span className="font-semibold text-ink">{4 - waiting.length}</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Backlog from yesterday</span><span className="font-semibold text-ink">3</span></li>
          </ul>
          <div className="mt-4 rounded-lg bg-accent-soft p-3 text-xs text-accent">
            Reminder: confirm patient identifiers with two identifiers and allergies before vitals per policy.
          </div>
        </Card>
      </div>
    </div>
  );
}

export default NurseDashboardPage;