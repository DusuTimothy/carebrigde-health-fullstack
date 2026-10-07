import React, { useMemo } from 'react';
import { CheckCircle2, FlaskConical } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatDate } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

function ResultsPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const me = (db.providers ?? {})[Object.keys(db.providers ?? {}).find((id) => db.providers[id].userId === user?.id)];

  const results = useMemo(
    () => (db.labResults ?? []).filter((r) => r.providerId === me?.id).sort((a, b) => new Date(b.resultedAt ?? b.orderedAt) - new Date(a.resultedAt ?? a.orderedAt)),
    [db.labResults, me]
  );

  function tabVals(t) {
    if (t === 'abnormal') return results.filter((r) => r.components?.some((c) => c.status !== 'normal'));
    if (t === 'pending') return results.filter((r) => !r.signedOff);
    return results;
  }

  const [tab, setTab] = React.useState('pending');
  const rows = results.length ? tabVals(tab) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">Results review</h1>
      <p className="mt-1 text-sm text-ink-secondary">Sign off completed results so patients see the final version.</p>

      <div className="mt-4 flex gap-2">
        {[['pending', `Needs sign-off (${results.filter((r) => !r.signedOff).length})`], ['abnormal', `Abnormal (${results.filter((r) => r.components?.some((c) => c.status !== 'normal')).length})`], ['all', `All (${results.length})`]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold',
              tab === id ? 'border-accent bg-accent text-white' : 'border-line bg-surface-raised text-ink-secondary hover:border-accent hover:text-accent'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {rows.length === 0 && (
          <Card>
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-success-ink" />
              <p className="text-sm text-ink-muted">Nothing here — all results are signed off.</p>
            </div>
          </Card>
        )}
        {rows.map((r) => {
          const p = db.patients[r.patientId];
          return (
            <Card key={r.id} className="p-0">
              <CardHead
                title={r.name}
                sub={`${p ? `${p.firstName} ${p.lastName}` : 'Patient'} · Resulted ${r.resultedAt ? formatDate(r.resultedAt) : '—'}`}
                right={r.signedOff ? <StatusPill status="final" /> : <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning-ink"><FlaskConical className="h-4 w-4" /> Needs sign-off</span>}
              />
              <CardBody>
                <p className="rounded-lg bg-neutral-50 p-3 text-sm text-ink-secondary">{r.summary}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(r.components ?? []).map((c) => (
                    <div key={c.name} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium text-ink">{c.name}</p>
                        <p className="text-xs text-ink-muted">Ref: {c.range}</p>
                      </div>
                      <span className={cn('rounded-lg px-2 py-0.5 font-bold', c.status === 'above' ? 'bg-danger-soft text-danger-ink' : c.status === 'below' ? 'bg-warning-soft text-warning-ink' : 'bg-success-soft text-success-ink')}>
                        {c.value} {c.unit}
                      </span>
                    </div>
                  ))}
                </div>
                {!r.signedOff && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => {
                        dbActions.signResult({ actor: user?.id, labResultId: r.id });
                        push('Result signed off', `${r.name} is now final and visible to the patient.`, 'success');
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Sign off result
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ResultsPage;