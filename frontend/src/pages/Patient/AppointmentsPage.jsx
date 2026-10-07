import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Video } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Table from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Stepper.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatDate, formatTime, formatDayName } from '../../lib/format.js';
import cn from '../../lib/cn.js';

const PAGE_SIZE = 8;
const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'all', label: 'All' },
];

function AppointmentsPage() {
  const [db] = useDB();
  const { user } = useAuth();
  const [tab, setTab] = useState('upcoming');
  const [page, setPage] = useState(1);

  const all = useMemo(
    () =>
      db.appointments
        .filter((a) => a.patientUserId === user?.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [db.appointments, user]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    if (tab === 'upcoming') return all.filter((a) => a.status !== 'cancelled' && new Date(a.date) >= now);
    if (tab === 'past') return all.filter((a) => a.status === 'cancelled' || new Date(a.date) < now);
    return all;
  }, [all, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function providerLabel(a) {
    const pv = db.providers[a.providerId];
    const u = pv ? db.users[pv.userId] : null;
    return u ? `Dr. ${u.firstName} ${u.lastName}` : '—';
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Appointments</h1>
          <p className="text-sm text-ink-secondary">Book, review and manage all of your visits.</p>
        </div>
        <Button to="/portal/patient/book">
          Book a visit
        </Button>
      </div>

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setPage(1); }}
            aria-pressed={tab === t.id}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-all',
              tab === t.id ? 'border-accent bg-accent text-white' : 'border-line bg-surface-raised text-ink-secondary hover:border-accent hover:text-accent'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Table
          columns={[
            {
              key: 'date',
              header: 'Date & time',
              render: (a) => (
                <div>
                  <p className="font-semibold text-ink">{formatDayName(a.date)}, {formatDate(a.date)}</p>
                  <p className="text-xs text-ink-muted">{formatTime(a.date)} · {a.type === 'video' ? 'Video visit' : 'In-person'}</p>
                </div>
              ),
            },
            { key: 'provider', header: 'Clinician', render: (a) => <span className="whitespace-nowrap">{providerLabel(a)}</span> },
            {
              key: 'reason',
              header: 'Reason',
              render: (a) => <span className="max-w-[220px] truncate text-ink-secondary block">{a.reason}</span>,
            },
            { key: 'status', header: 'Status', render: (a) => <StatusPill status={a.status} /> },
            {
              key: 'actions',
              header: '',
              className: 'text-right',
              render: (a) => (
                <Link to={`/portal/patient/appointments/${a.id}`} aria-label={`View appointment details`} className="inline-flex items-center gap-0.5 text-sm font-semibold text-accent hover:text-accent-deep">
                  Details <ChevronRight className="h-4 w-4" />
                </Link>
              ),
            },
          ]}
          rows={rows}
          empty="No appointments match this view."
        />
        {filtered.length > PAGE_SIZE && (
          <div className="mt-4 rounded-xl border border-line bg-surface-raised">
            <Pagination page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} pageSize={PAGE_SIZE} />
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentsPage;