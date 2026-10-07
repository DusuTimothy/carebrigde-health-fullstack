import React, { useMemo, useState } from 'react';
import { CalendarDays, MapPin, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Stepper.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatDate, formatTime, slotTimeToString } from '../../lib/format.js';

const PAGE_SIZE = 6;

function visitTime(appt) {
  const iso = appt.date + (appt.time ? `T${slotTimeToString(appt.time)}` : 'T00:00:00');
  return iso;
}

function VisitHistoryPage() {
  const [db] = useDB();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const visits = useMemo(
    () =>
      (db.appointments ?? [])
        .filter((a) => a.patientUserId === user?.id && ['completed', 'cancelled'].includes(a.status))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [db.appointments, user]
  );

  const pageCount = Math.max(1, Math.ceil(visits.length / PAGE_SIZE));
  const rows = visits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Visit history</h1>
        <p className="mt-1 text-sm text-ink-secondary">A full record of your completed appointments with notes and outcomes.</p>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((a) => {
          const p = db.providers[a.providerId];
          const u = p ? db.users[p.userId] : null;
          return (
            <Card key={a.id} flush className="transition-shadow hover:shadow-md">
              <button
                onClick={() => setSelected(a)}
                className="flex w-full flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 text-left"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <CalendarDays className="h-6 w-6" />
                </span>
                <span className="min-w-[150px] flex-1">
                  <span className="block text-sm font-semibold text-ink">{a.service} with {u ? `Dr. ${u.lastName}` : 'Carebridge'}</span>
                  <span className="block text-xs text-ink-muted">
                    {formatDate(a.date)} at {a.time ? formatTime(a.date + `T${slotTimeToString(a.time)}`) : '—'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <MapPin className="h-3.5 w-3.5" /> {a.location}
                </span>
                <StatusPill status={a.status} />
              </button>
            </Card>
          );
        })}
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-line-strong p-10 text-center text-sm text-ink-muted">
            No past visits yet.{' '}
            <Link to="/portal/patient/book" className="font-semibold text-accent hover:underline">Book your first appointment</Link>.
          </div>
        )}
      </div>

      {visits.length > PAGE_SIZE && (
        <div className="mt-4 rounded-xl border border-line bg-surface-raised">
          <Pagination page={page} pageCount={pageCount} total={visits.length} onPage={setPage} pageSize={PAGE_SIZE} />
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Visit summary"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs text-ink-muted"><Clock3 className="h-3.5 w-3.5" /> 30-minute visit recorded on {selected ? formatDate(selected.date) : ''}</p>
            <Button to="/portal/patient/book" variant="outline">Book a follow-up</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-neutral-50 p-4 text-sm text-ink-secondary">
              <p className="text-lg font-semibold text-ink">{selected.service}</p>
              <p className="mt-1">
                {selected.location} · {formatDate(selected.date)} at {selected.time ? formatTime(selected.date + `T${slotTimeToString(selected.time)}`) : '—'}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-ink">What we discussed</p>
              <p className="leading-relaxed text-ink-secondary">
                For this sorted visit you discussed your current symptoms, reviewed recent measurements, and agreed on a care plan. Your clinician entered
                a diagnosis of <strong>{selected.diagnosis ?? 'essential hypertension (I10)'}</strong> and set review dates for your follow-up.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-line p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-ink-muted">Diagnoses</p>
                <p className="mt-1 font-medium text-ink">{selected.diagnosis ?? 'Essential hypertension (I10)'}</p>
              </div>
              <div className="rounded-lg border border-line p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-ink-muted">Notes shared to you</p>
                <p className="mt-1 font-medium text-ink">After-visit summary available to download</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VisitHistoryPage;