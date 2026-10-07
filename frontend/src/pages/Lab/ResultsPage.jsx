import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatDate, formatTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';

function LabResultsPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();

  const results = (db.labResults ?? []).sort((a, b) => new Date(b.resultedAt) - new Date(a.resultedAt));
  const signed = results.filter((r) => r.signedOff).length;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Results</h1>
        <p className="text-sm text-ink-secondary">Resulted panels. Lab verifies results; providers sign off before patients see them.</p>
      </div>

      <div className="mt-4 space-y-3">
        {results.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">No results yet.</p>}
        {results.map((r) => {
          const p = db.patients[r.patientId];
          const prov = db.providers[r.providerId];
          const provUser = prov ? db.users[prov.userId] : null;
          return (
            <Card key={r.id} className="p-0">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal-deep">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-ink-muted">
                    {p ? `${p.firstName} ${p.lastName}` : '—'} · resulted {formatDate(r.resultedAt)} {formatTime(r.resultedAt)} · by {provUser ? `Dr. ${provUser.lastName}` : '—'}
                  </p>
                </div>
                <StatusPill status={r.status} />
                {!r.signedOff ? (
                  <Button size="sm" onClick={() => { dbActions.signResult({ actor: user?.id, labResultId: r.id }); push('Result signed', `${r.name} released for sign-off.`, 'success'); }}>
                    Sign off
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-teal-deep">Signed ✓</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 rounded-lg bg-neutral-50 p-3 text-xs text-ink-muted">
        {signed} of {results.length} results signed off. In production, sign-off routes to the ordering provider's inbox and releases the result to the patient portal.
      </p>
    </div>
  );
}

export default LabResultsPage;
