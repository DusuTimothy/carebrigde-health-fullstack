import React, { useMemo, useState } from 'react';
import { FlaskConical, ChevronRight, Download } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Table from '../../components/ui/Table.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatDate, formatTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

function valueTone(status) {
  if (status === 'above') return 'text-danger-ink bg-danger-soft';
  if (status === 'below') return 'text-warning-ink bg-warning-soft';
  return 'text-success-ink bg-success-soft';
}

function LabResultsPage() {
  const [db] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState('all');

  const all = useMemo(
    () =>
      (db.labResults ?? [])
        .filter((r) => r.patientUserId === user?.id)
        .sort((a, b) => new Date(b.resultedAt ?? b.orderedAt) - new Date(a.resultedAt ?? a.orderedAt)),
    [db.labResults, user]
  );

  const filtered = useMemo(() => {
    if (filter === 'flagged') return all.filter((r) => r.components?.some((c) => c.status !== 'normal'));
    if (filter === 'final') return all.filter((r) => r.status === 'final');
    return all;
  }, [all, filter]);

  const open = all.find((r) => r.id === openId) ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Lab results</h1>
        <p className="mt-1 text-sm text-ink-secondary">Review completed tests with plain-language explanations.</p>

        <div className="mt-4 flex gap-2">
          {[['all', 'All'], ['flagged', 'Needs attention'], ['final', 'Final']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-semibold transition-all',
                filter === id ? 'border-accent bg-accent text-white' : 'border-line bg-surface-raised text-ink-secondary hover:border-accent hover:text-accent'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2.5">
          {filtered.map((r) => {
            const flagged = r.components?.some((c) => c.status !== 'normal');
            return (
              <button
                key={r.id}
                onClick={() => setOpenId(r.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border bg-surface-raised p-4 text-left transition-all hover:shadow-md',
                  open?.id === r.id ? 'border-accent ring-4 ring-accent/15' : 'border-line'
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{r.name}</span>
                  <span className="block text-xs text-ink-muted">
                    {r.resultedAt ? formatDate(r.resultedAt) : formatDate(r.orderedAt)} · {r.status === 'final' ? 'Final' : 'Pending'}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {flagged && <Pill tone="warning">Review</Pill>}
                  <ChevronRight className="h-4 w-4 text-ink-muted" />
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-muted">No results match this filter.</div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div>
        {open ? (
          <Card>
            <CardHead
              title={open.name}
              sub={`Ordered ${formatDate(open.orderedAt)} · Resulted ${open.resultedAt ? `${formatDate(open.resultedAt)} at ${formatTime(open.resultedAt)}` : '—'}`}
              right={<Pill tone={open.components?.some((c) => c.status !== 'normal') ? 'warning' : 'success'} dot>{open.status === 'final' ? 'Final' : 'Pending'}</Pill>}
            />
            <div className="border-b border-line p-5">
              <p className="rounded-lg bg-neutral-50 p-3 text-sm text-ink-secondary">{open.summary}</p>
            </div>
            <Table
              columns={[
                { key: 'name', header: 'Test' },
                {
                  key: 'value', header: 'Your value', render: (c) => (
                    <span className={cn('inline-block rounded-lg px-2 py-0.5 font-bold', valueTone(c.status))}>
                      {c.value} <span className="font-normal text-ink-muted">{c.unit}</span>
                    </span>
                  )
                },
                { key: 'range', header: 'Reference range', render: (c) => <span className="text-ink-muted">{c.range}</span> },
                { key: 'status', header: 'Status', render: (c) => <StatusPill status={c.status} /> },
              ]}
              rows={open.components ?? []}
            />
            <div className="flex justify-end gap-2 p-4">
              <button
                onClick={() => push('Download started', 'This demo would export a PDF of your results.', 'info')}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-4 text-sm font-semibold text-ink-secondary hover:border-accent hover:text-accent"
              >
                <Download className="h-4 w-4" /> Export PDF
              </button>
            </div>
          </Card>
        ) : (
          <Card className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <FlaskConical className="mx-auto h-8 w-8 text-ink-muted" />
              <p className="mt-3 text-sm text-ink-muted">Select a result to see the details.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default LabResultsPage;