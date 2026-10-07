import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, ImagePlus } from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { refreshStore } from '../../lib/db.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const FILTERS = [
  { key: 'all', label: 'All articles' },
  { key: 'news', label: 'News' },
  { key: 'health_library', label: 'Health library' },
];

const inputCls = 'w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25';

const EMPTY_FORM = {
  category: 'news',
  title: '',
  date: new Date().toISOString().slice(0, 10),
  readTime: '',
  excerpt: '',
  body: '',
  url: '',
};

export default function ContentPage() {
  const { push } = useToast();
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const payload = await apiRequest('/api/content');
      setList(payload.data || []);
    } catch (error) {
      push('Could not load articles', error?.message || 'Something went wrong.', 'danger');
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = filter === 'all' ? list : list.filter((a) => a.category === filter);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCurrentImage(null);
    setImageData(null);
    setOpen(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      category: a.category,
      title: a.title || '',
      date: a.date ? String(a.date).slice(0, 10) : '',
      readTime: a.readTime || '',
      excerpt: a.excerpt || '',
      body: a.body || '',
      url: a.url || '',
    });
    setCurrentImage(a.imageUrl || null);
    setImageData(null);
    setOpen(true);
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  async function save() {
    if (!form.title.trim()) {
      push('Missing title', 'A headline is required.', 'danger');
      return;
    }
    setSaving(true);
    try {
      const body = JSON.stringify({ ...form, date: form.date || null });
      let articleId = editingId;
      if (editingId) {
        await apiRequest(`/api/content/${editingId}`, { method: 'PUT', body });
      } else {
        const payload = await apiRequest('/api/content', { method: 'POST', body });
        articleId = payload.data?.id;
      }
      if (imageData && articleId) {
        await apiRequest('/api/images', {
          method: 'POST',
          body: JSON.stringify({ entityType: 'article', entityId: articleId, dataUrl: imageData, filename: form.title.replace(/\s+/g, '-').toLowerCase().slice(0, 40) || 'article' }),
        });
      }
      await load();
      await refreshStore();
      push('Saved', editingId ? 'Article updated.' : 'Article published.', 'success');
      setOpen(false);
    } catch (error) {
      push('Action failed', error?.message || 'Something went wrong.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function remove(a) {
    if (!window.confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    setDeletingId(a.id);
    try {
      await apiRequest(`/api/content/${a.id}`, { method: 'DELETE' });
      await load();
      await refreshStore();
      push('Article deleted', 'Removed from the site.', 'success');
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
          <h1 className="text-2xl font-bold tracking-tight text-ink">Content</h1>
          <p className="text-sm text-ink-secondary">News and health-library articles shown on the public site.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New article</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.key ? 'bg-accent text-white' : 'bg-neutral-100 text-ink-secondary hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {visible.length === 0 && (
          <div className="rounded-xl border border-dashed border-line bg-surface-raised p-8 text-center text-sm text-ink-muted">
            No articles yet. Click “New article” to publish one.
          </div>
        )}
        {visible.map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-xl border border-line bg-surface-raised p-4">
            <div
              className="media-tile media-edge h-16 w-28 shrink-0 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${a.imageUrl || '/images/health/doctor-team.jpg'})` }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${a.category === 'news' ? 'bg-accent-soft text-accent' : 'bg-teal-soft text-teal-deep'}`}>
                  {a.category === 'news' ? 'News' : 'Health library'}
                </span>
                {a.date && <span className="text-xs text-ink-muted">{a.date}</span>}
                {a.readTime && <span className="text-xs text-ink-muted">· {a.readTime} read</span>}
              </div>
              <h3 className="mt-1 truncate text-base font-semibold text-ink">{a.title}</h3>
              <p className="truncate text-sm text-ink-secondary">{a.excerpt || a.summary}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button onClick={() => openEdit(a)} aria-label="Edit" className="rounded-lg p-2 text-ink-secondary hover:bg-accent-soft hover:text-accent">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(a)} disabled={deletingId === a.id} aria-label="Delete" className="rounded-lg p-2 text-ink-secondary hover:bg-danger-soft hover:text-danger-ink disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? `Edit · ${form.title || 'article'}` : 'New article'}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save article'}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Category</label>
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="news">News</option>
                <option value="health_library">Health library</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Date</label>
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Title</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article headline" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Read time</label>
            <input className={inputCls} value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} placeholder="e.g. 4 min read" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Excerpt</label>
            <textarea rows={3} className={inputCls} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary shown on cards" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Body</label>
            <textarea rows={6} className={inputCls} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Full article text" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Link (optional)</label>
            <input className={inputCls} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Image</label>
            <div className="flex items-center gap-3">
              {(imageData || currentImage) && (
                <img
                  src={imageData || currentImage}
                  alt="Article"
                  className="media-edge h-16 w-28 rounded-lg object-cover"
                />
              )}
              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <ImagePlus className="h-4 w-4" /> {currentImage ? 'Replace image' : 'Upload image'}
                </Button>
                {imageData && (
                  <Button variant="ghost" onClick={() => setImageData(null)}>Remove new image</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}