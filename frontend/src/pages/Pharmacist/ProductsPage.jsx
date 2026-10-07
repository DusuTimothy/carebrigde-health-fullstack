import React, { useMemo, useState } from 'react';
import { PackagePlus, Pencil, Trash2 } from 'lucide-react';
import { useDB, refreshStore } from '../../lib/db.js';
import { apiRequest } from '../../lib/api.js';
import Button from '../../components/ui/Button.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatCurrency } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

const inputCls = 'w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25';

export default function ProductsPage() {
  const [db] = useDB();
  const { push } = useToast();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const products = db.drugCatalog ?? [];
  const categoryOptions = Object.values(
    products.reduce((acc, p) => {
      if (!acc[p.categoryId]) acc[p.categoryId] = { id: p.categoryId, name: p.category };
      return acc;
    }, {})
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => !needle || `${p.name} ${p.generic} ${p.category} ${p.manufacturer}`.toLowerCase().includes(needle));
  }, [products, q]);

  function openNew() {
    setEditing('new');
    setForm({ requiresPrescription: false, status: 'active', stockQuantity: 0, price: 0 });
  }

  function openEdit(p) {
    setEditing(p.id);
    setForm({
      categoryId: p.categoryId,
      name: p.name,
      generic: p.generic,
      form: p.form,
      strength: p.strength,
      price: p.price,
      discountPrice: p.discountPrice || null,
      stockQuantity: p.stockQuantity,
      minimumStock: p.minimumStock || 0,
      requiresPrescription: p.requiresPrescription,
      status: p.status,
      manufacturer: p.manufacturer,
      brand: p.brand || '',
    });
  }

  async function save() {
    if (!form.name || !form.categoryId) {
      push('Missing details', 'Name and category are required.', 'danger');
      return;
    }
    setSaving(true);
    try {
      const url = editing === 'new' ? '/api/products' : `/api/products/${editing}`;
      await apiRequest(url, { method: editing === 'new' ? 'POST' : 'PUT', body: form });
      await refreshStore();
      push(editing === 'new' ? 'Product added' : 'Product updated', 'Catalog saved to the database.', 'success');
      setEditing(null);
    } catch (error) {
      push('Action failed', error?.message || 'Something went wrong.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function remove(p) {
    if (!window.confirm(`Delete ${p.name} from the catalog?`)) return;
    setDeletingId(p.id);
    try {
      await apiRequest(`/api/products/${p.id}`, { method: 'DELETE' });
      await refreshStore();
      push('Product removed', `${p.name} was deleted.`, 'success');
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
          <h1 className="text-2xl font-bold tracking-tight text-ink">Product catalog</h1>
          <p className="text-sm text-ink-secondary">{products.length} items · {products.filter((p) => p.inStock).length} in stock.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search catalog…"
            className="w-full max-w-xs rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25"
          />
          <Button onClick={openNew}><PackagePlus className="h-4 w-4" /> Add product</Button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.imageUrl && <img src={p.imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{p.name}</p>
                      <p className="truncate text-xs text-ink-muted">{p.form} · {p.strength}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-secondary">{p.category}</td>
                <td className="px-4 py-3 font-medium text-ink">{formatCurrency(p.price)}</td>
                <td className={cn('px-4 py-3', p.stockQuantity <= (p.minimumStock || 0) ? 'font-semibold text-danger-ink' : 'text-ink-secondary')}>
                  {p.stockQuantity}
                </td>
                <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button aria-label="Edit" className="rounded-lg p-2 text-ink-muted hover:bg-accent-soft hover:text-accent" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button aria-label="Delete" className="rounded-lg p-2 text-ink-muted hover:bg-danger-soft hover:text-danger-ink" onClick={() => remove(p)} disabled={deletingId === p.id}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-ink-muted">No products match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-raised p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink">{editing === 'new' ? 'Add product' : 'Edit product'}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Name" span="sm:col-span-2">
                <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Category">
                <select value={form.categoryId || ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
                  <option value="">Select…</option>
                  {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Form">
                <input value={form.form || ''} onChange={(e) => setForm({ ...form, form: e.target.value })} className={inputCls} placeholder="Tablet" />
              </Field>
              <Field label="Generic / brand">
                <input value={form.generic || ''} onChange={(e) => setForm({ ...form, generic: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Strength">
                <input value={form.strength || ''} onChange={(e) => setForm({ ...form, strength: e.target.value })} className={inputCls} placeholder="500mg" />
              </Field>
              <Field label="Price">
                <input type="number" min="0" step="0.01" value={form.price ?? ''} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Stock quantity">
                <input type="number" min="0" value={form.stockQuantity ?? ''} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className={inputCls} />
              </Field>
              <label className="flex items-center gap-2 pt-5 text-sm text-ink-secondary sm:col-span-2">
                <input type="checkbox" checked={Boolean(form.requiresPrescription)} onChange={(e) => setForm({ ...form, requiresPrescription: e.target.checked })} className="h-4 w-4 accent-accent" />
                Requires a prescription (Rx)
              </label>
              <Field label="Status">
                <select value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  {['active', 'inactive', 'discontinued'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save product'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, span }) {
  return (
    <label className={cn('block', span)}>
      <span className="mb-1 block text-xs font-semibold text-ink-secondary">{label}</span>
      {children}
    </label>
  );
}