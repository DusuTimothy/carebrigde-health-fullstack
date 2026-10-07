import React from 'react';
import { PackageCheck, ShieldCheck } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { timeAgo } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';

function FulfillPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();

  const queue = (db.pharmacyQueue ?? []).filter((o) => o.status !== 'fulfilled');
  const done = (db.pharmacyQueue ?? []).filter((o) => o.status === 'fulfilled');

  function verify(o) {
    dbActions.fulfillPharmacyOrder({ actor: user?.id, orderId: o.id, status: 'awaiting_verification' });
    push('Verification queued', `${o.drug} flagged for clinical review.`, 'info');
  }

  function fulfill(o) {
    dbActions.fulfillPharmacyOrder({ actor: user?.id, orderId: o.id, status: 'fulfilled' });
    push('Dispensed', `${o.drug} ${o.strength} for ${o.patientName} marked fulfilled.`, 'success');
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Fulfillment</h1>
        <p className="text-sm text-ink-secondary">Packaging, verification and dispense workflow for the day.</p>
      </div>

      <div className="mt-4 space-y-3">
        {queue.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">All orders fulfilled. Great work!</p>}
        {queue.map((o) => (
          <Card key={o.id} className="p-0">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning-ink">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{o.drug} <span className="font-normal text-ink-muted">{o.strength}</span></p>
                <p className="text-xs text-ink-muted">{o.patientName} · {o.directions} · requested {timeAgo(o.requestedAt)}</p>
                <p className="text-xs text-ink-muted">{o.assurance}</p>
              </div>
              <StatusPill status={o.status} />
              <div className="flex shrink-0 gap-2">
                {o.status !== 'awaiting_verification' && (
                  <Button size="sm" variant="outline" onClick={() => verify(o)}>Send to verification</Button>
                )}
                <Button size="sm" onClick={() => fulfill(o)}>
                  <PackageCheck className="h-4 w-4" /> Fill & dispense
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {done.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-ink">Fulfilled today</h2>
          <div className="mt-2 space-y-2">
            {done.map((o) => (
              <Card key={o.id} className="p-0">
                <div className="flex items-center gap-3 px-5 py-3">
                  <PackageCheck className="h-5 w-5 text-teal-deep" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{o.drug} {o.strength}</p>
                    <p className="text-xs text-ink-muted">{o.patientName} · filled {timeAgo(o.fulfilledAt ?? o.requestedAt)}</p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FulfillPage;