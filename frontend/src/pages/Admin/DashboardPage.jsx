import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, DollarSign, ClipboardCheck, UsersRound, TrendingUp, ArrowRight } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import { SummaryCard, StatusPill } from '../../components/shared/portal-common.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { formatDate, formatCurrency } from '../../lib/format.js';

function AdminDashboardPage() {
  const [db] = useDB();
  const { user } = useAuth();

  const todayAppts = useMemo(() => {
    const today = new Date().toDateString();
    return (db.appointments ?? []).filter((a) => new Date(a.date).toDateString() === today).length;
  }, [db.appointments]);

  const waiting = (db.checkins ?? []).filter((c) => c.status === 'waiting').length;
  const occupied = (db.facilities ?? []).reduce((s, f) => s + f.bedsOccupied, 0);
  const totalBeds = (db.facilities ?? []).reduce((s, f) => s + f.bedsTotal, 0);
  const latest = db.reports?.revenueByMonth?.[db.reports.revenueByMonth.length - 1];
  const activeStaff = (db.staffRoster ?? []).filter((s) => s.onDuty).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Operations dashboard</h1>
          <p className="text-sm text-ink-secondary">Carebridge Health · {user?.email}</p>
        </div>
        <Link to="/portal/admin/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
          View reports <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SummaryCard icon={ClipboardCheck} label="Appts today" value={todayAppts} hint="across all sites" tone="blue" />
        <SummaryCard icon={BedDouble} label="Occupancy" value={`${occupied}/${totalBeds}`} hint={occupied > 0 ? `${Math.round((occupied / totalBeds) * 100)}% of beds` : 'no inpatient beds'} tone="amber" />
        <SummaryCard icon={UsersRound} label="Waiting" value={waiting} hint="check-ins waiting" tone="red" />
        <SummaryCard icon={DollarSign} label="Revenue MTD" value={latest ? formatCurrency(latest.revenue) : '—'} hint={`${latest?.visits ?? 0} visits`} tone="teal" />
        <SummaryCard icon={UsersRound} label="On duty" value={activeStaff} hint="staff now" tone="gray" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card flush>
          <CardHead
            title="Check-in queue"
            right={<Link to="/portal/admin/checkins" className="text-xs font-semibold text-accent hover:underline">Open queue →</Link>}
          />
          <div className="divide-y divide-line">
            {(db.checkins ?? []).slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-muted">{c.reason} · {c.room}</p>
                </div>
                <StatusPill status={c.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card flush>
          <CardHead
            title="Latest claims"
            right={<Link to="/portal/admin/billing" className="text-xs font-semibold text-accent hover:underline">Billing →</Link>}
          />
          <div className="divide-y divide-line">
            {(db.reports?.claims ?? []).map((cl) => (
              <div key={cl.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{cl.id} · {cl.patient}</p>
                  <p className="text-xs text-ink-muted">{cl.payer} · {formatCurrency(cl.amount)}</p>
                </div>
                <StatusPill status={cl.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHead title="This week at a glance" />
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-neutral-50 px-4 py-3">
            <p className="text-xs text-ink-muted">MTD revenue</p>
            <p className="mt-0.5 flex items-center gap-1 text-lg font-bold text-ink"><TrendingUp className="h-4 w-4 text-teal-deep" /> {latest ? formatCurrency(latest.revenue) : '—'}</p>
          </div>
          <div className="rounded-lg bg-neutral-50 px-4 py-3">
            <p className="text-xs text-ink-muted">No-shows (MTD)</p>
            <p className="mt-0.5 text-lg font-bold text-ink">{latest?.noShows ?? 0}</p>
          </div>
          <div className="rounded-lg bg-neutral-50 px-4 py-3">
            <p className="text-xs text-ink-muted">Last report generated</p>
            <p className="mt-0.5 text-lg font-bold text-ink">{formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </Card>

      {(db.wards ?? []).length > 0 && (
        <Card className="mt-6">
          <CardHead
            title="Ward occupancy"
            right={<Link to="/portal/admin/wards" className="text-xs font-semibold text-accent hover:underline">Manage wards →</Link>}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(db.wards ?? []).map((ward) => {
              const bedsList = ward.beds || [];
              const occ = (ward.beds || []).filter((b) => b.status === 'occupied').length;
              const pct = bedsList.length ? Math.round((occ / bedsList.length) * 100) : 0;
              return (
                <div key={ward.id} className="rounded-lg border border-line p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{ward.name}</p>
                    <p className="shrink-0 text-xs text-ink-muted">{occ}/{bedsList.length} occupied</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#C0392B' : pct >= 70 ? '#E67E22' : '#1E7E6E' }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-muted">
                    {bedsList.length === 0 ? 'No beds configured' : pct === 0 ? 'Available' : `${pct}% occupied`}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdminDashboardPage;
