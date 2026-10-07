import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, UserRoundCheck, CalendarCheck2, UserPlus, ArrowRight } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import { SummaryCard, StatusPill } from '../../components/shared/portal-common.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { formatTime } from '../../lib/format.js';

function FrontDeskDashboardPage() {
  const [db] = useDB();
  const { user } = useAuth();

  const queue = (db.checkins ?? []).filter((c) => c.status === 'waiting');
  const roomed = (db.checkins ?? []).filter((c) => c.status === 'in_room');
  const today = new Date().toDateString();
  const todayScheduled = (db.appointments ?? []).filter((a) => new Date(a.date).toDateString() === today).length;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Front desk</h1>
        <p className="text-sm text-ink-secondary">Carebridge Medical Centre, Ikeja · {user?.email}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={ClipboardCheck} label="Waiting" value={queue.length} hint="patients in lobby" tone="amber" />
        <SummaryCard icon={UserRoundCheck} label="In room" value={roomed.length} hint="with clinicians" tone="blue" />
        <SummaryCard icon={CalendarCheck2} label="Today's visits" value={todayScheduled} hint="scheduled today" tone="teal" />
        <SummaryCard icon={UserPlus} label="Walk-ins" value="2" hint="checked in today" tone="gray" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card flush>
          <CardHead
            title="Checked in now"
            right={<Link to="/portal/front-desk/checkins" className="text-xs font-semibold text-accent hover:underline">Open queue →</Link>}
          />
          <div className="divide-y divide-line">
            {(db.checkins ?? []).slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar name={c.name} size="sm" tone={c.status === 'in_room' ? 'primary' : 'teal'} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-muted">{c.reason} · {c.room} · arrived {formatTime(c.arrivedAt)}</p>
                </div>
                <StatusPill status={c.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Today's arrivals" />
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Appointments</span><span className="font-semibold text-ink">{todayScheduled}</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Self check-in kiosks</span><span className="font-semibold text-ink">3 in use</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Avg wait</span><span className="font-semibold text-ink">12 min</span></li>
          </ul>
          <p className="mt-4 rounded-lg bg-accent-soft p-3 text-xs text-accent">
            Reminder: consent forms are collected at registration. See the check-in queue to manage arrivals.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default FrontDeskDashboardPage;