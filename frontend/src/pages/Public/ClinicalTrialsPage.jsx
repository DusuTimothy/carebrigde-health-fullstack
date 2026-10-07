import React, { useMemo, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { PageHero, SearchBox } from '../../components/ui/Page.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Button from '../../components/ui/Button.jsx';
import { Accordion } from '../../components/ui/Disclosure.jsx';

const FAQ = [
  {
    id: 't1',
    summary: 'What is a clinical trial?',
    details: 'A clinical trial is a research study that tests a new treatment, device or screening method in people. Trials follow a strict plan (protocol) that protects participants and answers a specific question.',
  },
  {
    id: 't2',
    summary: 'Why are trials important?',
    details: 'Nearly every treatment we use today — from vaccines to cancer drugs — was proven safe and effective in a clinical trial. Participation is how medicine improves.',
  },
  {
    id: 't3',
    summary: 'What are the risks?',
    details: 'Risks vary by study. There may be side effects or the experimental arm may be less effective than standard care. The informed consent process explains known risks before you enroll, and you can leave a study at any time without affecting your regular care.',
  },
  {
    id: 't4',
    summary: 'Will a trial change what I pay?',
    details: 'Study-related tests and procedures are typically covered by the sponsor. Care that is part of a normal course of treatment is billed to your insurance as usual. Every study will walk you through costs during consent.',
  },
  {
    id: 't5',
    summary: 'Who can enroll?',
    details: 'Each study has eligibility criteria — age, diagnosis, prior treatments and health history. The study team reviews your profile to see if you match.',
  },
];

export default function ClinicalTrialsPage() {
  const [db] = useDB();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => ['all', ...new Set(db.clinicalTrials.map((t) => t.category))], [db.clinicalTrials]);

  const filtered = useMemo(() => {
    let list = db.clinicalTrials;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(needle) || t.summary.toLowerCase().includes(needle));
    }
    if (status !== 'all') list = list.filter((t) => t.status === status);
    if (category !== 'all') list = list.filter((t) => t.category === category);
    return list;
  }, [db.clinicalTrials, q, status, category]);

  return (
    <>
      <PageHero
        title="Clinical trials"
        lead="Help us answer the next big question in medicine. Search our open studies, learn the risks and benefits, and talk to a coordinator."
        crumbs={[{ label: 'Find care' }, { label: 'Clinical trials' }]}
        image="/images/health/lab-2.jpg"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button to="/portal/patient/book?guest=1" variant="outlineInverse">Talk to a coordinator</Button>
          </div>
        }
      >
        <div className="mt-8">
          <SearchBox value={q} onChange={setQ} onSubmit={() => {}} placeholder="Search by condition or keyword — e.g. diabetes, breast cancer" />
        </div>
      </PageHero>

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Pill tone={status === 'all' ? 'brand' : 'neutral'} className="cursor-pointer" onClick={() => setStatus('all')}>All</Pill>
          <Pill tone={status === 'recruiting' ? 'brand' : 'neutral'} className="cursor-pointer" onClick={() => setStatus('recruiting')}>Recruiting</Pill>
          <Pill tone={status === 'not_recruiting' ? 'brand' : 'neutral'} className="cursor-pointer" onClick={() => setStatus('not_recruiting')}>Not recruiting</Pill>
          <select aria-label="Filter trials by category" value={category} onChange={(e) => setCategory(e.target.value)} className="ml-auto rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-sm text-ink-secondary focus:border-accent focus:outline-none">
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((t) => (
            <article key={t.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-5 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <div className="flex gap-1.5">
                  <Pill tone={t.status === 'recruiting' ? 'success' : 'neutral'} dot>{t.status === 'recruiting' ? 'Recruiting' : 'Not recruiting'}</Pill>
                  <Pill tone="brand">{t.phase}</Pill>
                </div>
              </div>
              <h3 className="text-base font-semibold leading-snug text-ink">{t.title}</h3>
              <p className="text-sm text-ink-secondary">{t.summary}</p>
              <div className="rounded-lg bg-neutral-50 p-3 text-xs text-ink-muted">
                <p className="mb-1 font-semibold text-ink-secondary">Who can join</p>
                {t.eligibility}
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-ink-muted">📌 {t.locations.join(' · ')}</span>
                {t.status === 'recruiting' && (
                  <Button size="sm" variant="outline">Check my eligibility</Button>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">Questions about participating?</h2>
          <Accordion items={FAQ} />
        </div>
      </section>
    </>
  );
}