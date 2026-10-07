import React, { useState } from 'react';
import { Quote } from 'lucide-react';
import { useDB, hydratePublic } from '../../lib/db.js';
import { apiRequest } from '../../lib/api.js';
import { PageHero } from '../../components/ui/Page.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatDate } from '../../lib/format.js';

const inputCls = 'w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25';

const TAG_OPTIONS = ['Recovery journey', 'First day home', 'Care team', 'Milestone', 'Patient story'];

function PatientStoriesPage() {
  const [db] = useDB();
  const { push } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', tag: 'Recovery journey', quote: '', consent: false });

  async function submitStory() {
    if (!form.name.trim()) {
      push('Missing name', 'Please tell us your name.', 'danger');
      return;
    }
    if (form.quote.trim().length < 10) {
      push('Tell us more', 'Please share at least a sentence about your journey.', 'danger');
      return;
    }
    if (!form.consent) {
      push('Consent required', 'Please confirm we may share your story.', 'danger');
      return;
    }
    setSending(true);
    try {
      await apiRequest('/api/public/stories', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, title: form.title || null, tag: form.tag, quote: form.quote, consent: form.consent }),
      });
      await hydratePublic();
      push('Thank you!', 'Your story has been shared with our community.', 'success');
      setShowForm(false);
      setForm({ name: '', title: '', tag: 'Recovery journey', quote: '', consent: false });
    } catch (error) {
      push('Could not share', error?.message || 'Something went wrong.', 'danger');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHero
        title="Patient stories"
        lead="Real people, real recoveries. These are the journeys that remind us why we do this work."
        crumbs={[{ label: 'Patient resources' }, { label: 'Patient stories' }]}
        image="/images/health/senior-rehab.jpg"
      />
      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {db.stories.map((s, i) => (
            <article key={s.id} className="flex flex-col rounded-2xl border border-line bg-surface-raised p-6 transition-all hover:-translate-y-0.5 hover:shadow-md" style={i === 0 ? { gridRow: 'span 1' } : undefined}>
              <Quote className="h-6 w-6 text-accent/40" aria-hidden />
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">
                “{s.quote}”
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <Avatar name={s.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
                  <p className="text-xs text-ink-muted">{formatDate(s.date)}</p>
                </div>
                <Pill tone="brand">{s.tag}</Pill>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-primary-900 px-8 py-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">Have a story to share?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/75">
            Patient stories give hope to families facing similar journeys. We'd love to hear yours — with your consent, of course.
          </p>
          <div className="mt-5 flex justify-center">
            <Button variant="inverse" onClick={() => setShowForm(true)}>
              Share your story
            </Button>
          </div>
        </div>
      </section>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Share your story"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submitStory} disabled={sending}>{sending ? 'Sharing…' : 'Share story'}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Your name</label>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="First name or initials" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Story title (optional)</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. My second chance" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Tag</label>
              <select className={inputCls} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                {TAG_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Your story</label>
            <textarea rows={5} className={inputCls} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="What did you go through, and how are you doing now?" />
          </div>
          <label className="flex items-start gap-2 rounded-lg border border-line bg-surface-raised p-3 text-sm text-ink-secondary">
            <input type="checkbox" className="mt-0.5" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            I understand and agree that Carebridge may share my story on this page for public display.
          </label>
        </div>
      </Modal>
    </>
  );
}

export default PatientStoriesPage;