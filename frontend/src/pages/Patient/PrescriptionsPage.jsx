import React, { useMemo, useState } from 'react';
import { PillIcon } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Table from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Stepper.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatDate } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

const PAGE_SIZE = 8;

function PrescriptionsPage() {
  const [db, dbActions] = useDB();
  const { user, requireReAuth } = useAuth();
  const { push } = useToast();
  const [filter, setFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [refillTarget, setRefillTarget] = useState(null);

  const all = useMemo(
    () => (db.prescriptions ?? []).filter((r) => r.patientUserId === user?.id),
    [db.prescriptions, user]
  );

  const filtered = useMemo(() => {
    if (filter === 'active') return all.filter((r) => r.status === 'active');
    if (filter === 'expired') return all.filter((r) => r.status !== 'active');
    return all;
  }, [all, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function requestRefill(rx) {
    dbActions.requestRefill({ patientId: user?.id, prescriptionId: rx.id });
    setRefillTarget(null);
    push('Refill requested', `${rx.drug} ${rx.strength} — your pharmacy received the request.`, 'success');
  }

  function statusOf(rx) {
    if (rx.refillStatus === 'pending') return 'refill-pending';
    return rx.status;
  }

  const tabs = [
    { id: 'active', label: `Active (${all.filter((r) => r.status === 'active').length})` },
    { id: 'expired', label: `Past (${all.filter((r) => r.status !== 'active').length})` },
    { id: 'all', label: 'All' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Prescriptions</h1>
          <p className="text-sm text-ink-secondary">View your medications and request refills from your care team.</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setFilter(t.id); setPage(1); }}
            aria-pressed={filter === t.id}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-all',
              filter === t.id ? 'border-accent bg-accent text-white' : 'border-line bg-surface-raised text-ink-secondary hover:border-accent hover:text-accent'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Card flush>
          <Table
            columns={[
              { key: 'drug', header: 'Medication', render: (r) => (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-soft text-teal-deep"><PillIcon className="h-4 w-4" /></span>
                  <div>
                    <p className="font-semibold text-ink">{r.drug} <span className="font-normal text-ink-muted">{r.strength}</span></p>
                    <p className="max-w-[260px] text-xs text-ink-muted">{r.directions}</p>
                  </div>
                </div>
              ) },
              {
                key: 'provider', header: 'Prescribed by', render: (r) => {
                  const u = db.users[db.providers[r.providerId]?.userId];
                  return u ? `Dr. ${u.lastName}` : '—';
                }
              },
              { key: 'refills', header: 'Refills left', render: (r) => <span className="text-ink-secondary">{r.refillsRemaining}</span> },
              { key: 'last', header: 'Last refilled', render: (r) => <span className="text-ink-muted">{r.lastRefill ? formatDate(r.lastRefill) : '—'}</span> },
              { key: 'status', header: 'Status', render: (r) => <StatusPill status={statusOf(r)} /> },
              {
                key: 'actions', header: '', className: 'text-right',
                render: (r) =>
                  r.status === 'active' && r.refillStatus !== 'pending' ? (
                    <Button size="sm" variant="outline" onClick={() => setRefillTarget(r)}>Request refill</Button>
                  ) : (
                    <span className="text-xs text-ink-muted">{r.refillStatus === 'pending' ? 'In review' : ''}</span>
                  ),
              },
            ]}
            rows={rows}
            empty="No prescriptions in this view."
          />
        </Card>
        {filtered.length > PAGE_SIZE && (
          <div className="mt-4 rounded-xl border border-line bg-surface-raised">
            <Pagination page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} pageSize={PAGE_SIZE} />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(refillTarget)}
        onClose={() => setRefillTarget(null)}
        title="Request a refill"
        footer={
          <>
            <Button variant="outline" onClick={() => setRefillTarget(null)}>Cancel</Button>
            <Button onClick={() => requestRefill(refillTarget)} disabled={!refillTarget?.refillsRemaining}>
              Yes, request refill
            </Button>
          </>
        }
      >
        {refillTarget && (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>
              <strong className="text-ink">{refillTarget.drug} {refillTarget.strength}</strong> — {refillTarget.directions}
            </p>
            <p>
              {refillTarget.refillsRemaining > 0
                ? `You have ${refillTarget.refillsRemaining} refill${refillTarget.refillsRemaining === 1 ? '' : 's'} remaining. Your care team will review the request.`
                : 'No refills remain on this prescription. You will need a new prescription from your clinician.'}
            </p>
            <Pill tone="info">Usually reviewed within 2 business days</Pill>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PrescriptionsPage;