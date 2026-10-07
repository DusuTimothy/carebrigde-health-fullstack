import React, { useMemo, useState } from 'react';
import { FlaskConical, Stethoscope } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Input.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatDateTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';

function OrdersPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const me = (db.providers ?? {})[Object.keys(db.providers ?? {}).find((id) => db.providers[id].userId === user?.id)];

  const orders = useMemo(
    () => (db.labOrders ?? []).filter((o) => o.providerId === me?.id).sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt)),
    [db.labOrders, me]
  );

  const [patient, setPatient] = useState(() => Object.keys(db.patients ?? {})[0] ?? '');
  const [panel, setPanel] = useState('Lipid Panel');

  const panels = ['Lipid Panel', 'CBC with Differential', 'Comprehensive Metabolic Panel', 'Hemoglobin A1c', 'TSH'];

  function place(e) {
    e.preventDefault();
    dbActions.placeOrder({ actor: user?.id, providerId: me?.id, patientId: patient, type: 'lab', name: panel });
    push('Lab order placed', `${panel} ordered and sent to the collection team.`, 'success');
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink-secondary">Place and track laboratory orders for your patients.</p>

        <Card flush className="mt-6">
          <CardHead title="Recent orders" />
          {orders.length === 0 && <p className="px-5 py-8 text-sm text-ink-muted">No orders placed yet.</p>}
          <div className="divide-y divide-line">
            {orders.map((o) => {
              const p = db.patients[o.patientId];
              return (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3.5">
                  <FlaskConical className="h-5 w-5 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{o.name}</p>
                    <p className="text-xs text-ink-muted">
                      {p ? `${p.firstName} ${p.lastName}` : 'Patient'} · {formatDateTime(o.orderedAt)}
                    </p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHead title="New lab order" sub="Sent to specimen collection" />
        <form onSubmit={place} className="space-y-4 p-5">
          <Select label="Patient" value={patient} onChange={(e) => setPatient(e.target.value)}>
            {Object.values(db.patients ?? {}).map((p) => (
              <option key={p.userId} value={p.userId}>{p.firstName} {p.lastName}</option>
            ))}
          </Select>
          <Select label="Panel" value={panel} onChange={(e) => setPanel(e.target.value)}>
            {panels.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Button type="submit" className="w-full">
            <Stethoscope className="h-4 w-4" /> Place order
          </Button>
          <p className="text-xs text-ink-muted">Orders follow your site's standing orders policy and route to the on-site lab.</p>
        </form>
      </Card>
    </div>
  );
}

export default OrdersPage;