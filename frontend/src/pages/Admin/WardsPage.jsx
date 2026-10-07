import React, { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useDB, refreshStore } from '../../lib/db.js';
import { apiRequest } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

export default function WardsPage() {
  const [db, dbActions] = useDB();
  const { push } = useToast();
  const [tab, setTab] = useState('wards');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const wards = db.wards ?? [];
  const beds = db.beds ?? [];
  const departments = (db.clinicalDepartments && db.clinicalDepartments.length ? db.clinicalDepartments : db.departments) ?? [];

  const occupancy = (w) => {
    const list = beds.filter((b) => b.wardId === w.id);
    const occupied = list.filter((b) => b.status === 'occupied').length;
    return { total: list.length, occupied, available: list.filter((b) => b.status === 'available').length };
  };

  async function createWard() {
    if (!form.name || !form.departmentId) {
      push('Missing details', 'Ward name and department are required.', 'danger');
      return;
    }
    setSaving(true);
    try {
      await apiRequest('/api/wards', { method: 'POST', body: JSON.stringify(form) });
      await refreshStore();
      push('Ward created', 'Capacity added to the facility.', 'success');
      setCreating(false);
      setForm({});
    } catch (error) {
      push('Action failed', error?.message || 'Something went wrong.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Wards &amp; beds</h1>
          <p className="text-sm text-ink-secondary">
            {wards.length} wards · {beds.length} beds · {beds.filter((b) => b.status === 'occupied').length} occupied.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Add ward</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[['wards', 'Wards'], ['beds', 'Beds']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
              tab === key ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-secondary hover:bg-neutral-100'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'wards' ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {wards.map((w) => {
            const occ = occupancy(w);
            const pct = occ.total ? Math.round((occ.occupied / occ.total) * 100) : 0;
            return (
              <Card key={w.id} className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{w.name}</p>
                    <p className="truncate text-xs text-ink-muted">{w.department?.name || w.wardType || 'General'}</p>
                  </div>
                  <StatusPill status={w.status} />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-muted">{occ.occupied} of {occ.total} occupied</span>
                    <span className="font-semibold text-ink">{pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface-raised">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3">Bed</th>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {beds.map((b) => (
                <tr key={b.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{b.label || b.bedNumber}</td>
                  <td className="px-4 py-3 text-ink-secondary">{b.ward?.name || b.wardName}</td>
                  <td className="px-4 py-3 text-ink-secondary">{(wards.find((w) => w.id === b.wardId)?.department)?.name || '—'}</td>
                  <td className="px-4 py-3"><StatusPill status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink">Add a ward</h3>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Ward name</span>
                <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Renal Ward" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Department</span>
                <select value={form.departmentId || ''} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className={inputCls}>
                  <option value="">Select department…</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Ward type</span>
                <select value={form.wardType || ''} onChange={(e) => setForm({ ...form, wardType: e.target.value })} className={inputCls}>
                  <option value="">General</option>
                  {['emergency', 'medical', 'surgical', 'pediatric', 'maternity', 'private', 'icu'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Bed capacity</span>
                <input type="number" min="1" value={form.capacity == null ? '' : form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={inputCls} placeholder="e.g. 8" />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
                <Button onClick={createWard} disabled={saving}>{saving ? 'Saving…' : 'Add ward'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25';