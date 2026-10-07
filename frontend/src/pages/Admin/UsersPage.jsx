import React, { useState } from 'react';
import { UserRound, Plus, Trash2 } from 'lucide-react';
import { useDB, refreshStore } from '../../lib/db.js';
import { apiRequest } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { backendRoleOf } from '../../lib/rbac.js';

const ROLE_OPTIONS = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory_staff', 'accountant'];

const inputCls = 'w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25';

export default function UsersPage() {
  const [db] = useDB();
  const { push } = useToast();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  const staff = (db.users ? Object.values(db.users) : []).filter((u) => u.roleBackend !== 'patient').sort((a, b) => a.name.localeCompare(b.name));
  const departments = (db.clinicalDepartments && db.clinicalDepartments.length ? db.clinicalDepartments : db.departments) ?? [];

  async function createUser() {
    if (!form.name || !form.email || !form.role) {
      push('Missing details', 'Name, email and role are required.', 'danger');
      return;
    }
    setSaving(true);
    try {
      await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || null, password: form.password || 'Password123!', role: form.role, departmentId: form.departmentId || null }),
      });
      await refreshStore();
      push('User created', 'Account added to the directory.', 'success');
      setCreating(false);
      setForm({});
    } catch (error) {
      push('Action failed', error?.message || 'Something went wrong.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function assignDepartment(u, departmentId) {
    if (departmentId === (u.departmentId || '')) return;
    setAssigningId(u.id);
    try {
      await apiRequest(`/api/users/${u.id}`, { method: 'PUT', body: JSON.stringify({ departmentId: departmentId || null }) });
      await refreshStore();
      push('Assignment updated', departmentId ? `${u.name} assigned to a department.` : `${u.name} unassigned.`, 'success');
    } catch (error) {
      push('Action failed', error?.message || 'Something went wrong.', 'danger');
    } finally {
      setAssigningId(null);
    }
  }

  async function removeUser(u) {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    setDeletingId(u.id);
    try {
      await apiRequest(`/api/users/${u.id}`, { method: 'DELETE' });
      await refreshStore();
      push('User removed', `${u.name} was deleted.`, 'success');
    } catch (error) {
      push('Action failed', error?.message || 'Something went wrong.', 'danger');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Users</h1>
          <p className="text-sm text-ink-secondary">{staff.length} staff accounts.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Invite user</Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((u) => (
          <Card key={u.id} className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={u.name} size="md" src={u.imageUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{u.name}</p>
                <p className="truncate text-xs text-ink-muted">{u.email}</p>
              </div>
              {u.roleBackend !== 'admin' && (
                <button
                  aria-label={`Delete ${u.name}`}
                  onClick={() => removeUser(u)}
                  disabled={deletingId === u.id}
                  className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger-ink"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-2 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-ink-secondary">
              {u.role}
            </p>
            <label className="mt-3 block">
              <span className="mb-1 block text-[11px] font-semibold text-ink-secondary">Department</span>
              <select
                value={u.departmentId || ''}
                onChange={(event) => assignDepartment(u, event.target.value)}
                disabled={assigningId === u.id}
                className="w-full rounded-lg border border-line bg-surface-raised px-2.5 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25"
              >
                <option value="">Not assigned</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
          </Card>
        ))}
      </div>

      {creating && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink">Invite a staff user</h3>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Full name</span>
                <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Dr. Omotola Adeyemi" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Email</span>
                <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="user@hospital.com" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Phone</span>
                <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+233…" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Role</span>
                <select value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                  <option value="">Select role…</option>
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{backendRoleOf(r)} · {r}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Department</span>
                <select value={form.departmentId || ''} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className={inputCls}>
                  <option value="">Not assigned</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
                <Button onClick={createUser} disabled={saving}>{saving ? 'Saving…' : 'Create account'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 flex items-center gap-1.5 rounded-lg bg-neutral-50 p-3 text-xs text-ink-muted">
        <UserRound className="h-4 w-4" /> New accounts use the default password and log in through the secure portal.
      </p>
    </div>
  );
}