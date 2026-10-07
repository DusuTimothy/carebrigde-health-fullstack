import React from 'react';
import { PillIcon, AlertTriangle, PackageCheck } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { timeAgo } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

function PharmacistOrdersPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const queue = db.pharmacyQueue ?? [];

  function fulfill(o) {
    dbActions.fulfillPharmacyOrder({ actor: user?.id, orderId: o.id, status: 'fulfilled' });
    push('Order filled', `${o.drug} ${o.strength} for ${o.patientName} marked fulfilled.`, 'success');
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Prescription queue</h1>
        <p className="text-sm text-ink-secondary">Prescriptions routed from providers and refill requests, all visible here.</p>
      </div>

      <div className="mt-4 space-y-3">
        {queue.map((o) => {
          const isUrgent = o.assurance?.includes('High-alert');
          return (
            <Card key={o.id} className="p-0">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${isUrgent ? 'bg-warning-soft text-warning-ink' : 'bg-teal-soft text-teal-deep'}`}>
                  {isUrgent ? <AlertTriangle className="h-5 w-5" /> : <PillIcon className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{o.drug} <span className="font-normal text-ink-muted">{o.strength}</span></p>
                  <p className="text-xs text-ink-muted">{o.patientName} · {o.directions}</p>
                  <p className="text-xs text-ink-muted">Requested {timeAgo(o.requestedAt)} · {o.assurance}</p>
                </div>
                <StatusPill status={o.status} />
                {o.status !== 'fulfilled' && (
                  <Button size="sm" onClick={() => fulfill(o)}>
                    <PackageCheck className="h-4 w-4" /> Fill & dispense
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

export default PharmacistOrdersPage;