import React, { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { PageHero, SearchBox, LazyBg } from '../../components/ui/Page.jsx';
import Pill from '../../components/ui/Pill.jsx';
import { formatDate } from '../../lib/format.js';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';

const RELATED_BODY = {
  'Five daily habits that keep your heart healthy': 'Physical activity, sleep, nutrition, stress and connection — the five pillars. The good news: you don\u2019t need a gym membership or a perfect diet. Movement snacks (a brisk 10-minute walk after meals), consistent bedtimes, more whole food than packaged, five slow breaths before responding to a stressor, and calling a friend on the drive home all compound into meaningful protection.',
  'A parent\u2019s guide to back-to-school immunizations': 'Reviewing your child\u2019s vaccine record before school starts prevents outbreaks and keeps classrooms safe. Most kids can complete any catch-up doses in a single well visit, and many shots are available the same week you book. Bring your child\u2019s record card and any physician\u2019s notes.',
};

function NewsPage() {
  const [db] = useDB();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [open, setOpen] = useState(null);

  const categories = useMemo(() => ['all', ...new Set(db.news.map((n) => n.category))], [db.news]);

  const featured = db.news[0];
  const filtered = useMemo(() => {
    let list = db.news;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(needle) || n.excerpt.toLowerCase().includes(needle));
    }
    if (category !== 'all') list = list.filter((n) => n.category === category);
    return list;
  }, [db.news, q, category]);

  return (
    <>
      <PageHero
        title="News & insights"
        lead="Research breakthroughs, wellness guidance and the people behind them."
        crumbs={[{ label: 'About' }, { label: 'News & insights' }]}
        image="/images/health/doctor-team.jpg"
      >
        <div className="mt-8">
          <SearchBox value={q} onChange={setQ} onSubmit={() => {}} placeholder="Search articles and research — e.g. heart health" />
        </div>
      </PageHero>

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Pill key={c} tone={category === c ? 'brand' : 'neutral'} className="cursor-pointer" onClick={() => setCategory(c)}>
              {c === 'all' ? 'All categories' : c}
            </Pill>
          ))}
        </div>

        {/* Featured */}
        {featured && category === 'all' && !q.trim() && (
          <article className="group mb-6 overflow-hidden rounded-2xl border border-line bg-surface-raised transition-all hover:shadow-md">
            <LazyBg image={featured.img || '/images/health/doctor-team.jpg'} className="media-tile media-edge relative aspect-[16/7]" />
            <div className="flex flex-col gap-2 p-6">
              <Pill tone="brand" className="w-fit">{featured.category}</Pill>
              <h2 className="text-xl font-bold leading-snug text-ink group-hover:text-accent md:text-2xl">{featured.title}</h2>
              <p className="max-w-[64ch] text-sm text-ink-secondary">{featured.excerpt}</p>
              <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                <Clock className="h-3 w-3" /> {formatDate(featured.date)} · {featured.readTime}
              </p>
            </div>
          </article>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <article key={n.id} className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface-raised transition-all hover:-translate-y-0.5 hover:shadow-md">
              <LazyBg image={n.img || '/images/health/consult.jpg'} className="media-tile media-edge relative h-32" />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <Pill tone="neutral" className="w-fit">{n.category}</Pill>
                <h3 className="text-sm font-semibold leading-snug text-ink group-hover:text-accent">{n.title}</h3>
                <p className="mt-auto flex items-center gap-1.5 text-xs text-ink-muted">
                  <Clock className="h-3 w-3" /> {formatDate(n.date)} · {n.readTime}
                </p>
                <button onClick={() => setOpen(n)} className="mt-2 text-left text-sm font-semibold text-accent hover:text-accent-deep">
                  Read article →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Modal
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        footer={<Button variant="outline" onClick={() => setOpen(null)}>Close</Button>}
      >
        {open && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">{open.category} · {formatDate(open.date)} · {open.readTime}</p>
            <p className="text-sm leading-relaxed text-ink-secondary">
              {RELATED_BODY[open.title] ?? open.excerpt}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

export default NewsPage;