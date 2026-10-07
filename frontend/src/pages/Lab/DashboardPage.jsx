import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, TestTube2, Timer, Gauge } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import { SummaryCard, StatusPill } from '../../components/shared/portal-common.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { timeAgo } from '../../lib/format.js';

function LabDashboardPage() {
  const [db] = useDB();
  const { user } = useAuth();

  const pending = useMemo(() => (db.labOrders ?? []).filter((o) => o.status === 'pending_collection'), [db.labOrders]);
  const inProgress = useMemo(() => (db.labOrders ?? []).filter((o) => o.status === 'in_progress'), [db.labOrders]);
  const resulted = useMemo(() => (db.labOrders ?? []).filter((o) => o.status === 'resulted'), [db.labOrders]);
  const unreadResults = (db.labResults ?? []).filter((r) => !r.signedOff).length;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Lab dashboard</h1>
        <p className="text-sm text-ink-secondary">Carebridge Medical Centre, Ikeja · Core Laboratory</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={Timer} label="Awaiting collection" value={pending.length} hint="orders to collect" tone="amber" />
        <SummaryCard icon={TestTube2} label="Running" value={inProgress.length} hint="orders on instruments" tone="blue" />
        <SummaryCard icon={FlaskConical} label="Resulted" value={resulted.length} hint="ready for sign-off" tone="teal" />
        <SummaryCard icon={Gauge} label="Avg turnaround" value="41m" hint="target under 60m" tone="gray" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card flush>
          <CardHead
            title="Instrument status"
            right={<Link to="/portal/lab/orders" className="text-xs font-semibold text-accent hover:underline">Order queue →</Link>}
          />
          <div className="divide-y divide-line">
            {(db.labInstruments ?? []).map((ins) => (
              <div key={ins.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{ins.name}</p>
                  <p className="text-xs text-ink-muted">{ins.current} · {ins.queueCount} in queue</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${ins.utilization}%` }} />
                  </div>
                  <span className="w-9 text-right text-xs font-semibold text-ink">{ins.utilization}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card flush>
          <CardHead
            title="Recent orders"
            right={<Link to="/portal/lab/orders" className="text-xs font-semibold text-accent hover:underline">View all →</Link>}
          />
          <div className="divide-y divide-line">
            {(db.labOrders ?? []).slice(0, 4).map((o) => {
              const p = db.patients[o.patientId];
              return (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{o.name}</p>
                    <p className="text-xs text-ink-muted">
                      {p ? `${p.firstName} ${p.lastName}` : '—'} · ordered {timeAgo(o.orderedAt)}
                    </p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {unreadResults > 0 && (
        <p className="mt-6 rounded-lg bg-accent-soft p-3 text-sm text-accent">
          {unreadResults} result{unreadResults === 1 ? '' : 's'} {unreadResults === 1 ? 'is' : 'are'} ready for provider sign-off. · Signed in as {user?.firstName}.
        </p>
      )}
    </div>
  );
}

export default LabDashboardPage;
