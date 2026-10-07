import React, { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useDB, refreshStore } from '../../lib/db.js';
import { apiRequest } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const inputCls = 'w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25';

export default function DepartmentsPage() {
  const [db] = useDB();
  const { push } = useToast();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const departments = (db.clinicalDepartments && db.clinicalDepartments.length ? db.clinicalDepartments : db.departments) ?? [];
  const doctorsByDept = Object.values(db.doctors ?? {});

  async function createDepartment() {
    if (!form.name) {
      push('Missing details', 'Department name is required.', 'danger');
      return;
    }
    setSaving(true);
    try {
      await apiRequest('/api/departments', { method: 'POST', body: { name: form.name, description: form.description || null } });
      await refreshStore();
      push('Department created', 'Added to the facility directory.', 'success');
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
          <h1 className="text-2xl font-bold tracking-tight text-ink">Departments</h1>
          <p className="text-sm text-ink-secondary">{departments.length} clinical departments.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Add department</Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => {
          const staff = doctorsByDept.filter((doc) => doc.departmentId === d.id).length;
          return (
            <Card key={d.id} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-soft text-teal-deep">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{d.name}</p>
                  <p className="text-xs text-ink-muted">{staff} clinician{staff === 1 ? '' : 's'}</p>
                </div>
                <StatusPill status={d.status} />
              </div>
              {d.description && <p className="mt-3 text-sm text-ink-secondary">{d.description}</p>}
            </Card>
          );
        })}
      </div>

      {creating && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink">Add a department</h3>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Department name</span>
                <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Nephrology" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Description</span>
                <textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="Optional" />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
                <Button onClick={createDepartment} disabled={saving}>{saving ? 'Saving…' : 'Add department'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}