import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { Card } from '../../components/ui/Card.jsx';
import { formatDate } from '../../lib/format.js';
import cn from '../../lib/cn.js';

export default function RecordsPage() {
  const [db] = useDB();
  const [q, setQ] = useState('');

  const doctors = db.doctors ?? {};
  const patients = db.patients ?? {};
  const patientName = (id) => patients[id]?.user?.name || `${patients[id]?.firstName || ''} ${patients[id]?.lastName || ''}`.trim() || 'Patient';

  const encounters = (db.encounters ?? []).filter((r) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return `${patientName(r.patientId)} ${doctors[r.providerId]?.firstName || ''} ${doctors[r.providerId]?.lastName || ''} ${r.reason || ''}`.toLowerCase().includes(needle);
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Medical records</h1>
          <p className="text-sm text-ink-secondary">{encounters.length} visit records across the facility.</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search patient, clinician or reason…"
          className="w-full max-w-sm rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25"
        />
      </div>

      <div className="mt-4 space-y-3">
        {encounters.map((r) => {
          const provider = doctors[r.providerId];
          const providerName = provider ? `Dr. ${provider.firstName} ${provider.lastName}` : '—';
          return (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{patientName(r.patientId)}</p>
                  <p className="text-xs text-ink-muted">{providerName} · {formatDate(r.date)}</p>
                </div>
                <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize', r.note ? 'bg-accent-soft text-accent' : 'bg-neutral-100 text-ink-secondary')}>
                  {r.reason || 'Consultation'}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Notes</p>
                  <p className="mt-0.5 text-ink-secondary">{r.note || r.symptoms || '—'}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Plan</p>
                  <p className="mt-0.5 text-ink-secondary">{(r.plan || []).join(', ') || '—'}</p>
                </div>
              </div>
            </Card>
          );
        })}
        {encounters.length === 0 && (
          <div className="rounded-xl border border-line bg-surface-raised p-8 text-center text-sm text-ink-muted">
            No medical records found.
          </div>
        )}
      </div>

      <p className="mt-6 flex items-center gap-1.5 rounded-lg bg-neutral-50 p-3 text-xs text-ink-muted">
        <FileText className="h-4 w-4" /> Read-only chart review. Clinicians author records from the results workspace.
      </p>
    </div>
  );
}