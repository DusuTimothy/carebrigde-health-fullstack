import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusPill, SummaryCard } from '../../components/shared/portal-common.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { DollarSign, CircleDollarSign, Hourglass } from 'lucide-react';
import cn from '../../lib/cn.js';

function BillingPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const [filter, setFilter] = useState('all');

  const claims = db.reports?.claims ?? [];
  const filtered = claims.filter((c) => filter === 'all' || c.status === filter);

  function markPaid(c) {
    dbActions.writeAudit({ actor: user?.id, action: 'PAY', target: c.id, detail: 'Claim marked paid (admin)' });
    push('Claim settled', `${c.id} marked as paid.`, 'success');
  }

  const total = claims.reduce((s, c) => s + c.amount, 0);
  const paid = claims.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const pending = claims.filter((c) => c.status === 'pending').length;

  const filters = ['all', 'submitted', 'pending', 'paid', 'denied'];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Billing & claims</h1>
        <p className="text-sm text-ink-secondary">Patient statements and payer claims — with revenue metrics in this demo session.</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={DollarSign} label="Total billed" value={formatCurrency(total)} hint="across demo claims" tone="blue" />
        <SummaryCard icon={CheckCircle2} label="Collected" value={formatCurrency(paid)} hint="paid claims" tone="teal" />
        <SummaryCard icon={Hourglass} label="In review" value={pending} hint="claims pending" tone="amber" />
        <SummaryCard icon={CircleDollarSign} label="Patient AR" value={formatCurrency(total - paid)} hint="outstanding" tone="gray" />
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
            {f.replace(/^\w/, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((c) => (
          <Card key={c.id} className="p-0">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{c.id} · {c.patient}</p>
                <p className="text-xs text-ink-muted">{c.payer} · {formatCurrency(c.amount)}</p>
              </div>
              <StatusPill status={c.status} />
              {c.status === 'pending' && (
                <Button size="sm" onClick={() => markPaid(c)}>Settle claim</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default BillingPage;