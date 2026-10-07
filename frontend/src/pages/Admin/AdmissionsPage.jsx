import React, { useState } from 'react';
import { BedDouble, Plus } from 'lucide-react';
import { useDB, refreshStore } from '../../lib/db.js';
import { apiRequest } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { Card } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

const STATUS_FILTERS = ['all', 'admitted', 'transferred', 'discharged', 'cancelled'];

export default function AdmissionsPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [action, setAction] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const admissions = (db.admissions ?? []).filter((a) => filter === 'all' || a.status === filter);
  const patients = Object.values(db.patients);
  const doctors = Object.values(db.doctors);
  const wards = db.wards ?? [];
  const beds = db.beds ?? [];
  const freeBeds = (wardId) => beds.filter((b) => b.wardId === wardId && b.status === 'available');

  async function run(method, url, body, successMsg) {
    try {
      await apiRequest(url, { method, body: body === undefined ? undefined : JSON.stringify(body) });
      await refreshStore();
      push(successMsg, 'Changes saved in the database.', 'success');
      return true;
    } catch (error) {
      push('Action failed', error?.message || 'Something went wrong.', 'danger');
      return false;
    }
  }

  async function doAdmit() {
    if (!form.patientId || !form.doctorId || !form.wardId) {
      push('Missing details', 'Select a patient, clinician and ward to admit.', 'danger');
      return;
    }
    setSaving(true);
    const body = { ...form };
    if (!body.bedId) delete body.bedId;
    const ok = await run('POST', '/api/admissions', body, 'Admission created');
    setSaving(false);
    if (ok) setAction(null);
  }

  async function doCancel(id) {
    setBusyId(id);
    await run('PUT', `/api/admissions/${id}/cancel`, {}, 'Admission cancelled');
    setBusyId(null);
  }

  function doTransfer(a) {
    setAction({ type: 'transfer', admission: a });
    setForm({ bedId: a.bedId || '' });
  }

  async function doDischarge(a) {
    setBusyId(a.id);
    await run('PUT', `/api/admissions/${a.id}/discharge`, { dischargeNotes: form[a.id] || '' }, 'Patient discharged');
    setBusyId(null);
  }

  async function doTransferSubmit(a) {
    if (!form.wardId || !form.bedId) {
      push('Missing details', 'Select a ward and bed for the transfer.', 'danger');
      return;
    }
    setBusyId(a.id);
    const ok = await run('PUT', `/api/admissions/${a.id}/transfer`, { ...form }, 'Transfer completed');
    setBusyId(null);
    if (ok) setAction(null);
  }

  const counts = {
    all: (db.admissions ?? []).length,
    admitted: (db.admissions ?? []).filter((a) => a.status === 'admitted').length,
    transferred: (db.admissions ?? []).filter((a) => a.status === 'transferred').length,
    discharged: (db.admissions ?? []).filter((a) => a.status === 'discharged').length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Admissions</h1>
          <p className="text-sm text-ink-secondary">{counts.admitted} admitted · {counts.transferred} transferred · {counts.discharged} discharged.</p>
        </div>
        <Button onClick={() => { setAction({ type: 'new' }); setForm({}); }}><Plus className="h-4 w-4" /> Admit patient</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
              filter === s ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-secondary hover:bg-neutral-100'
            )}
          >
            {s === 'all' ? `All (${counts.all})` : `${s} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {admissions.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{a.patientName}</p>
                <p className="text-xs text-ink-muted">
                  #{a.admissionNumber ?? a.id.slice(0, 8).toUpperCase()} · {a.admissionType || 'Standard'}
                </p>
              </div>
              <StatusPill status={a.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="text-ink-muted">Clinician</span>
              <span className="text-right text-ink">{a.doctorName || '—'}</span>
              <span className="text-ink-muted">Ward / bed</span>
              <span className="text-right text-ink">{a.wardName || '—'}{a.bedLabel ? ` · ${a.bedLabel}` : ''}</span>
              <span className="text-ink-muted">Reason</span>
              <span className="truncate text-right text-ink">{a.reason || '—'}</span>
              <span className="text-ink-muted">Expected discharge</span>
              <span className="text-right text-ink">{a.expectedDischargeDate || '—'}</span>
            </div>
            {a.status === 'admitted' && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => doTransfer(a)}>Transfer bed</Button>
                <Button size="sm" variant="outline" onClick={() => doDischarge(a)}>Discharge</Button>
                <Button size="sm" variant="outline" tone="danger" onClick={() => doCancel(a.id)} disabled={busyId === a.id}>Cancel</Button>
              </div>
            )}
            {a.status === 'discharged' && (
              <div className="mt-4">
                <Button size="sm" variant="outline" onClick={() => setAction({ type: 'summary', admission: a })}>
                  Discharge summary
                </Button>
              </div>
            )}
          </Card>
        ))}
        {admissions.length === 0 && (
          <div className="rounded-xl border border-line bg-surface-raised p-8 text-center text-sm text-ink-muted md:col-span-2">
            No admissions match this filter.
          </div>
        )}
      </div>

      {action?.type === 'new' && (
        <Modal onClose={() => setAction(null)}>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-ink">Admit a patient</h3>
            <Field label="Patient">
              <select value={form.patientId || ''} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className={inputCls}>
                <option value="">Select patient…</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.user?.name || `${p.firstName} ${p.lastName}`}</option>)}
              </select>
            </Field>
            <Field label="Clinician in charge">
              <select value={form.doctorId || ''} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className={inputCls}>
                <option value="">Select clinician…</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
              </select>
            </Field>
            <Field label="Ward">
              <select value={form.wardId || ''} onChange={(e) => setForm({ ...form, wardId: e.target.value, bedId: '' })} className={inputCls}>
                <option value="">Select ward…</option>
                {wards.map((w) => <option key={w.id} value={w.id}>{w.name} ({freeBeds(w.id).length} free)</option>)}
              </select>
            </Field>
            {form.wardId && freeBeds(form.wardId).length > 0 && (
              <Field label="Bed">
                <select value={form.bedId || ''} onChange={(e) => setForm({ ...form, bedId: e.target.value })} className={inputCls}>
                  <option value="">Auto-assign first available</option>
                  {freeBeds(form.wardId).map((b) => <option key={b.id} value={b.id}>{b.label || b.bedNumber}</option>)}
                </select>
              </Field>
            )}
            <Field label="Reason for admission">
              <input value={form.reason || ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={inputCls} placeholder="e.g. Severe abdominal pain" />
            </Field>
            <Field label="Expected discharge date">
              <input type="date" value={form.expectedDischargeDate || ''} onChange={(e) => setForm({ ...form, expectedDischargeDate: e.target.value })} className={inputCls} />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setAction(null)}>Cancel</Button>
              <Button onClick={doAdmit} disabled={saving}>{saving ? 'Saving…' : 'Admit'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {action?.type === 'transfer' && (
        <Modal onClose={() => setAction(null)}>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-ink">Transfer {action.admission.patientName}</h3>
            <Field label="Ward">
              <select value={form.wardId || ''} onChange={(e) => setForm({ ...form, wardId: e.target.value, bedId: '' })} className={inputCls}>
                <option value="">Select ward…</option>
                {wards.map((w) => <option key={w.id} value={w.id}>{w.name} ({freeBeds(w.id).length} free)</option>)}
              </select>
            </Field>
            {form.wardId && freeBeds(form.wardId).length > 0 && (
              <Field label="Bed">
                <select value={form.bedId || ''} onChange={(e) => setForm({ ...form, bedId: e.target.value })} className={inputCls}>
                  <option value="">Assign to a room…</option>
                  {freeBeds(form.wardId).map((b) => <option key={b.id} value={b.id}>{b.label || b.bedNumber}</option>)}
                </select>
              </Field>
            )}
            <Field label="Reason">
              <input value={form.reason || ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={inputCls} placeholder="Optional" />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setAction(null)}>Cancel</Button>
              <Button onClick={() => doTransferSubmit(action.admission)} disabled={busyId === action.admission.id}>Confirm transfer</Button>
            </div>
          </div>
        </Modal>
      )}

      {action?.type === 'summary' && (
        <Modal onClose={() => setAction(null)}>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-ink">Discharge summary</h3>
            <p className="text-sm text-ink-secondary">{action.admission.patientName} · {action.admission.admissionNumber ?? action.admission.id.slice(0, 8).toUpperCase()}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-ink-muted">Clinician in charge</span>
              <span className="text-right text-ink">{action.admission.doctorName || '—'}</span>
              <span className="text-ink-muted">Ward / bed</span>
              <span className="text-right text-ink">{action.admission.wardName || '—'}{action.admission.bedLabel ? ` · ${action.admission.bedLabel}` : ''}</span>
              <span className="text-ink-muted">Admitted</span>
              <span className="text-right text-ink">{action.admission.admissionDate || '—'}</span>
              <span className="text-ink-muted">Discharged</span>
              <span className="text-right text-ink">{action.admission.dischargeDate || '—'}</span>
              <span className="text-ink-muted">Length of stay</span>
              <span className="text-right font-semibold text-ink">{stayLength(action.admission)}</span>
              <span className="text-ink-muted">Reason for admission</span>
              <span className="text-right text-ink">{action.admission.reason || '—'}</span>
              <span className="text-ink-muted">Admission diagnosis</span>
              <span className="text-right text-ink">{action.admission.diagnosis || '—'}</span>
              <span className="text-ink-muted">Final diagnosis</span>
              <span className="text-right text-ink">{action.admission.finalDiagnosis || '—'}</span>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="mb-1 text-xs font-semibold text-ink-muted">Discharge notes</p>
              <p className="whitespace-pre-wrap text-sm text-ink">{action.admission.dischargeNotes || 'No notes recorded.'}</p>
            </div>
            <div className="flex justify-end pt-1">
              <Button variant="ghost" onClick={() => setAction(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      <p className="mt-6 flex items-center gap-1.5 rounded-lg bg-neutral-50 p-3 text-xs text-ink-muted">
        <BedDouble className="h-4 w-4" /> Admissions read from the active ADT workflow; transfers and discharges update the ward census in the database.
      </p>
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25';

function stayLength(a) {
  if (!a.admissionDate) return '—';
  const end = a.dischargeDate ? new Date(a.dischargeDate) : new Date();
  const start = new Date(a.admissionDate);
  const days = Math.max(0, Math.round((end - start) / 86400000));
  return days <= 0 ? 'Same day' : `${days} day${days === 1 ? '' : 's'}`;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-secondary">{label}</span>
      {children}
    </label>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-surface-raised p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}