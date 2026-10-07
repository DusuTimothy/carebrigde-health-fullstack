import React, { useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Building2, FileText, FlaskConical, HeartPulse, Newspaper, SearchX, Stethoscope } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { PageHero, SearchBox } from '../../components/ui/Page.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { usePageMeta } from '../../lib/seo.js';

const GROUP_ICON = {
  clinicians: Stethoscope,
  locations: Building2,
  services: Award,
  topics: FileText,
  news: Newspaper,
  trials: FlaskConical,
  departments: HeartPulse,
};

const GROUP_META = {
  clinicians: { label: 'Clinicians', to: '/find-a-doctor', see: 'Find a doctor' },
  locations: { label: 'Locations & clinics', to: '/find-a-location', see: 'Find a location' },
  services: { label: 'Medical services', to: '/services', see: 'All services' },
  topics: { label: 'Health topics', to: '/health-library', see: 'Health library' },
  news: { label: 'News & insights', to: '/news-and-insights', see: 'All news' },
  trials: { label: 'Clinical trials', to: '/clinical-trials', see: 'All trials' },
  departments: { label: 'Departments', to: '/departments', see: 'Departments index' },
};

function Group({ id, items, q }) {
  const meta = GROUP_META[id];
  const Icon = GROUP_ICON[id];
  return (
    <section className="rounded-2xl border border-line bg-surface-raised p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Icon className="h-4 w-4" />
          </span>
          {meta.label}
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-ink-muted">{items.length}</span>
        </p>
        <Link to={meta.to} className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent hover:text-accent-deep">
          {meta.see} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {items.slice(0, 5).map((it, i) => (
          <li key={it.key ?? `${id}-${i}`}>
            <Link to={it.to} className="group flex items-center justify-between gap-3 py-3">
              {it.avatar && <Avatar name={it.avatar} size="sm" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink group-hover:text-accent">{it.title}</span>
                {it.sub && <span className="block truncate text-xs text-ink-muted">{it.sub}</span>}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
            </Link>
          </li>
        ))}
      </ul>
      {items.length > 5 && (
        <p className="mt-2 text-xs text-ink-muted">+{items.length - 5} more — see all in {meta.see}.</p>
      )}
    </section>
  );
}

export default function SearchResultsPage() {
  const [db] = useDB();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') ?? '';
  const needle = q.trim().toLowerCase();

  usePageMeta({
    title: q.trim() ? `Search results for “${q.trim()}”` : 'Search',
    description: q.trim() ? `Carebridge Health results for “${q.trim()}” — doctors, locations, services and health topics.` : 'Search Carebridge Health for clinicians, locations, services and health topics.',
  });

  const groups = useMemo(() => {
    if (!needle) return [];
    const hit = (...fields) => fields.some((f) => typeof f === 'string' && f.toLowerCase().includes(needle));

    const clinicians = Object.values(db.providers)
      .filter((p) => {
        const u = db.users[p.userId];
        return hit(`${u?.firstName ?? ''} ${u?.lastName ?? ''}`, p.specialtyName, p.location, p.title, p.bio);
      })
      .map((p) => ({
        key: p.id,
        avatar: `Dr. ${db.users[p.userId]?.firstName ?? ''} ${db.users[p.userId]?.lastName ?? ''}`,
        title: `Dr. ${db.users[p.userId]?.firstName ?? ''} ${db.users[p.userId]?.lastName ?? ''}`,
        sub: `${p.specialtyName} · ${p.location}`,
        to: `/portal/patient/book?specialty=${p.specialty}&provider=${p.id}`,
      }));

    const locations = db.locations
      .filter((l) => hit(l.name, l.address, l.type, ...(l.services ?? [])))
      .map((l) => ({ key: l.id, title: l.name, sub: `${l.type} · ${l.address}`, to: '/find-a-location' }));

    const services = db.serviceLines
      .filter((s) => hit(s.name, s.desc))
      .map((s) => ({ key: s.id, title: s.name, sub: s.desc, to: `/services/${s.id.replace('sl-', '')}` }));

    const topics = db.healthLibrary
      .filter((t) => hit(t.title, t.category, t.summary))
      .map((t) => ({ key: t.id, title: t.title, sub: `${t.category} · ${t.readTime} read`, to: '/health-library' }));

    const news = db.news
      .filter((n) => hit(n.title, n.excerpt, n.category))
      .map((n) => ({ key: n.id, title: n.title, sub: `${n.category} · ${n.readTime}`, to: '/news-and-insights' }));

    const trials = db.clinicalTrials
      .filter((t) => hit(t.title, t.summary, t.category, ...(t.locations ?? [])))
      .map((t) => ({ key: t.id, title: t.title, sub: `${t.category} · ${t.status}`, to: '/clinical-trials' }));

    const departments = db.departments
      .filter((d) => hit(d.name))
      .map((d) => ({ key: d.name, title: d.name, sub: 'Department', to: '/departments' }));

    return [
      { id: 'clinicians', items: clinicians },
      { id: 'locations', items: locations },
      { id: 'services', items: services },
      { id: 'topics', items: topics },
      { id: 'news', items: news },
      { id: 'trials', items: trials },
      { id: 'departments', items: departments },
    ].filter((g) => g.items.length > 0);
  }, [needle, db.providers, db.users, db.locations, db.serviceLines, db.healthLibrary, db.news, db.clinicalTrials, db.departments]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <PageHero
        title="Search"
        lead="One search across our clinicians, locations, medical services and health topics."
        crumbs={[{ label: 'Search' }]}
        image="/images/health/consult.jpg"
      >
        <div className="mt-8">
          <SearchBox
            value={q}
            onChange={(v) => {
              const next = new URLSearchParams(params);
              if (v) next.set('q', v);
              else next.delete('q');
              navigate(`/search?${next.toString()}`, { replace: true });
            }}
            onSubmit={() => {}}
            placeholder="Try “cardiology”, “Ikeja”, “high blood pressure” or “clinical trials”…"
          />
        </div>
      </PageHero>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        {!needle ? (
          <div className="rounded-2xl border border-line bg-surface-raised py-16 text-center">
            <SearchX className="mx-auto h-10 w-10 text-ink-muted" aria-hidden />
            <p className="mt-3 font-semibold text-ink">Search across Carebridge Health</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
              Find a doctor by name or specialty, locate a clinic near you, or browse health topics, news and clinical trials.
            </p>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface-raised py-16 text-center">
            <SearchX className="mx-auto h-10 w-10 text-ink-muted" aria-hidden />
            <p className="mt-3 font-semibold text-ink">No results for “{q.trim()}”</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
              Try a broader term — a specialty like “cardiology”, a city like “Lagos”, or a topic like “blood pressure”.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-ink-secondary">
              <strong className="text-ink">{total}</strong> result{total === 1 ? '' : 's'} for “{q.trim()}”
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              {groups.map((g) => (
                <Group key={g.id} id={g.id} items={g.items} q={q} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}