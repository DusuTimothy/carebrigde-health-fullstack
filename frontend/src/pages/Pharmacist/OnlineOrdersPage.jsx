import React, { useMemo, useState } from 'react';
import { PackageCheck, ShoppingBag, Truck, Store, AlertTriangle } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatCurrency, timeAgo } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

const NEXT_STEP = {
  placed: { status: 'processing', label: 'Start processing' },
  processing: { status: 'ready', label: 'Mark ready' },
  ready: { status: 'fulfilled', label: 'Dispatch / collect' },
};

function PharmacistOnlineOrdersPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('active');

  const orders = useMemo(() => db.pharmacyOrders ?? [], [db.pharmacyOrders]);

  const active = orders.filter((o) => ['placed', 'processing', 'ready'].includes(o.status));
  const completed = orders.filter((o) => o.status === 'fulfilled');
  const cancelled = orders.filter((o) => o.status === 'cancelled');

  const tabs = [
    { id: 'active', label: `Active (${active.length})` },
    { id: 'completed', label: `Completed (${completed.length})` },
    { id: 'cancelled', label: `Cancelled (${cancelled.length})` },
  ];

  function advance(o) {
    const step = NEXT_STEP[o.status];
    if (!step) return;
    dbActions.progressPharmacyOrder({ actor: user?.id, orderId: o.id, status: step.status });
    push(
      step.status === 'fulfilled' ? 'Dispatched' : 'Order updated',
      `Order ${o.id.toUpperCase()} for ${o.patientName} → ${step.label.toLowerCase()}.`,
      step.status === 'fulfilled' ? 'success' : 'info'
    );
  }

  const list = tab === 'active' ? active : tab === 'completed' ? completed : cancelled;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Online orders</h1>
        <p className="text-sm text-ink-secondary">
          Orders placed by patients through "Buy drugs online" — review, prepare and dispatch.
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
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

      <div className="mt-4 space-y-3">
        {list.length === 0 && (
          <Card>
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-ink-muted" />
              <p className="text-sm text-ink-muted">No {tab} online orders right now.</p>
            </div>
          </Card>
        )}

        {list.map((o) => (
          <Card key={o.id} data-order-id={o.id} className="p-0">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                {o.status === 'cancelled' ? <AlertTriangle className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  {o.id.toUpperCase()} <span className="font-normal text-ink-muted">· {o.patientName}</span>
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    {o.delivery?.method === 'delivery' ? <Truck className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
                    {o.delivery?.method === 'delivery' ? 'Delivery' : 'Store pickup'}
                  </span>
                  <span>Placed {timeAgo(o.placedAt)}</span>
                  <span className="font-semibold text-ink">{formatCurrency(o.total)}</span>
                </p>
                <p className="mt-1 truncate text-xs text-ink-muted">
                  {o.delivery?.method === 'delivery' ? o.delivery?.address : 'Carebridge Pharmacy, Ikeja'}
                  {o.delivery?.phone ? ` · ${o.delivery.phone}` : ''}
                </p>
              </div>
              <StatusPill status={o.status} />
              {NEXT_STEP[o.status] && (
                <Button size="sm" onClick={() => advance(o)}>
                  <PackageCheck className="h-4 w-4" /> {NEXT_STEP[o.status].label}
                </Button>
              )}
            </div>
            <div className="grid gap-x-8 gap-y-1 border-t border-line bg-neutral-50 px-5 py-3 text-xs text-ink-secondary lg:grid-cols-2">
              <div className="space-y-0.5">
                {o.items.map((i) => (
                  <p key={i.drugId}>
                    <strong className="text-ink">{i.qty}×</strong> {i.drug} <span className="text-ink-muted">({i.strength})</span> —{' '}
                    {formatCurrency(i.lineTotal)}
                  </p>
                ))}
              </div>
              <div className="space-y-0.5 lg:text-right">
                <p>Subtotal <strong className="text-ink">{formatCurrency(o.subtotal)}</strong></p>
                <p>Delivery <strong className="text-ink">{o.deliveryFee ? formatCurrency(o.deliveryFee) : 'Free'}</strong></p>
                <p className="text-sm font-bold text-ink">Total {formatCurrency(o.total)}</p>
                {o.note && <p className="text-ink-muted">Note: {o.note}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default PharmacistOnlineOrdersPage;