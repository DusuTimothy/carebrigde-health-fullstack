import React, { useState } from 'react';
import { FlaskConical, Microscope, CheckCircle2 } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { timeAgo } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

function LabOrdersPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const [filter, setFilter] = useState('all');

  const orders = (db.labOrders ?? []).sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
  const filtered = orders.filter((o) => filter === 'all' || o.status === filter);

  function advance(o) {
    const next = o.status === 'pending_collection' ? 'in_progress' : 'resulted';
    dbActions.advanceLabOrder({ actor: user?.id, labOrderId: o.id, status: next });
    push('Order updated', `${o.name} moved to ${next.replace('_', ' ')}.`, 'success');
  }

  const filters = ['all', 'pending_collection', 'in_progress', 'resulted'];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Order queue</h1>
          <p className="text-sm text-ink-secondary">All laboratory orders by status. Advance an order to simulate collection and processing.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
              filter === f ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-secondary hover:bg-neutral-100'
            )}
          >
            {f.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">No orders in this view.</p>}
        {filtered.map((o) => {
          const p = db.patients[o.patientId];
          const prov = db.providers[o.providerId];
          const provUser = prov ? db.users[prov.userId] : null;
          return (
            <Card key={o.id} className="p-0">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  {o.status === 'resulted' ? <CheckCircle2 className="h-5 w-5" /> : o.status === 'in_progress' ? <Microscope className="h-5 w-5" /> : <FlaskConical className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{o.name}</p>
                  <p className="text-xs text-ink-muted">
                    {p ? `${p.firstName} ${p.lastName}` : '—'} · ordered by {provUser ? `Dr. ${provUser.lastName}` : '—'} · {timeAgo(o.orderedAt)}
                  </p>
                </div>
                <StatusPill status={o.status} />
                {o.status !== 'resulted' && (
                  <Button size="sm" onClick={() => advance(o)}>
                    {o.status === 'pending_collection' ? 'Start processing' : 'Result'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default LabOrdersPage;
