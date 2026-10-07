import React from 'react';
import { Download, TrendingUp, BedDouble, CalendarCheck2, UserX } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatCurrency } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

function ReportsPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const r = db.reports;

  const maxRevenue = Math.max(...(r?.revenueByMonth ?? []).map((m) => m.revenue), 1);
  const maxOccupancy = Math.max(...(r?.occupancyByFacility ?? []).map((f) => f.rate), 1);

  function exportReport() {
    dbActions.writeAudit({ actor: user?.id, action: 'EXPORT', target: 'Reports', detail: 'Exported CSV (demo)' });
    push('Export started', 'Report PDF/CSV download simulated.', 'success');
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Reports</h1>
          <p className="text-sm text-ink-secondary">Key operational metrics for leadership. Exports are simulated in the demo.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportReport}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHead title="Revenue by month" />
          <div className="flex h-56 items-end gap-2 px-2">
            {(r?.revenueByMonth ?? []).map((m) => (
              <div key={m.month} className="group relative flex flex-1 flex-col items-center justify-end gap-1" title={m.month}>
                <span className="text-[10px] font-semibold text-ink">{formatCurrency(m.revenue / 1000).replace('.00', 'k').replace('$', '$')}</span>
                <div
                  className={cn('w-full rounded-t-lg bg-accent transition-colors group-hover:bg-accent-deep', m.month.includes('MTD') && 'bg-gold')}
                  style={{ height: `${Math.max(8, (m.revenue / maxRevenue) * 100)}%`, minHeight: 8 }}
                />
                <span className="whitespace-nowrap text-[10px] text-ink-muted">{m.month.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Occupancy by facility" />
          <ul className="space-y-3">
            {(r?.occupancyByFacility ?? []).map((f) => (
              <li key={f.facility}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{f.facility}</span>
                  <span className="font-semibold text-ink">{f.rate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-teal-400" style={{ width: `${(f.rate / maxOccupancy) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {(r?.claims ?? []).map((cl) => (
          <Card key={cl.id} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{cl.id}</span>
              <StatusPill status={cl.status} />
            </div>
            <p className="mt-1 text-xs text-ink-muted">{cl.patient} · {cl.payer}</p>
            <p className="mt-2 text-lg font-bold text-ink">{formatCurrency(cl.amount)}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: TrendingUp, label: 'Visits MTD', value: r?.revenueByMonth?.at(-1)?.visits ?? 0 },
          { icon: CalendarCheck2, label: 'Scheduled this week', value: (db.appointments ?? []).length },
          { icon: UserX, label: 'No-shows MTD', value: r?.revenueByMonth?.at(-1)?.noShows ?? 0 },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-ink-muted">{s.label}</p>
              <p className="text-xl font-bold text-ink">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ReportsPage;