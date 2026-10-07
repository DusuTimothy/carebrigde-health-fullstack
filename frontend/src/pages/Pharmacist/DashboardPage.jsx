import React, { useMemo } from 'react';
import { PillIcon, PackageCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import { SummaryCard } from '../../components/shared/portal-common.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { timeAgo, formatTime } from '../../lib/format.js';
import cn from '../../lib/cn.js';

function PharmacistDashboardPage() {
  const [db] = useDB();
  const { user } = useAuth();
  const queue = db.pharmacyQueue ?? [];
  const toFill = queue.filter((o) => o.status === 'ready_to_fill');
  const pending = queue.filter((o) => o.status === 'awaiting_verification');
  const filled = queue.filter((o) => o.status === 'fulfilled');

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome, {user?.firstName}</h1>
        <p className="text-sm text-ink-secondary">Carebridge Pharmacy, Ikeja · Day shift</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <SummaryCard icon={PillIcon} label="Ready to fill" value={toFill.length} hint="prescriptions awaiting packaging" tone="blue" />
        <SummaryCard icon={AlertTriangle} label="Needs check" value={pending.length} hint="clinical pharmacist review required" tone="amber" />
        <SummaryCard icon={PackageCheck} label="Filled today" value={filled.length} hint="dispatched to patients" tone="teal" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card flush>
          <CardHead title="Incoming queue" right={<Link to="/portal/pharmacist/orders" className="text-xs font-semibold text-accent hover:underline">Open queue →</Link>} />
          {toFill.slice(0, 4).map((o) => (
            <div key={o.id} className="flex items-center gap-3 border-b border-line px-5 py-3.5">
              <PillIcon className="h-5 w-5 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{o.drug} {o.strength}</p>
                <p className="text-xs text-ink-muted">{o.patientName} · requested {timeAgo(o.requestedAt)}</p>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <CardHead title="Daily metrics" />
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Policies checked</span><span className="font-semibold text-ink">{toFill.length + pending.length + filled.length}</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Allergy alerts cleared</span><span className="font-semibold text-ink">1</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Controlled substance fills</span><span className="font-semibold text-ink">0</span></li>
            <li className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2"><span>Delayed shipments</span><span className="font-semibold text-ink">0</span></li>
          </ul>
          <p className="mt-3 text-xs text-ink-muted">
            Last system sync {timeAgo(new Date())}. In production, eMAR integration would update automatically.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default PharmacistDashboardPage;