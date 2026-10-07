import React from 'react';
import { ShieldCheck, Microscope, Users, HeartHandshake, Building2, Award } from 'lucide-react';
import { PageHero } from '../../components/ui/Page.jsx';
import Button from '../../components/ui/Button.jsx';
import { SectionHead } from '../../components/shared/portal-common.jsx';
import { useDB } from '../../lib/db.js';

const VALUES = [
  { icon: ShieldCheck, title: 'Care that calms', desc: 'Clear explanations, less jargon, and a team that listens before it prescribes.' },
  { icon: Microscope, title: 'Discovery at the bedside', desc: 'Research doesn\u2019t stay in a lab — it changes the care you receive, faster.' },
  { icon: Users, title: 'People first', desc: 'Nondiscriminatory, culturally aware care from check-in to checkout.' },
  { icon: HeartHandshake, title: 'Access for all', desc: 'Sliding-scale programs and mobile clinics reach neighbors who need it most.' },
];

const STATS = [
  { value: '880k+', label: 'patients cared for each year' },
  { value: '300+', label: 'clinic locations' },
  { value: '5', label: 'hospitals across the region' },
  { value: '37,800', label: 'health care professionals' },
  { value: '4M+', label: 'outpatient visits per year' },
  { value: '37 yrs', label: 'on the national honor roll' },
];

function AboutPage() {
  const [db] = useDB();
  return (
    <>
      <PageHero
        title="About Carebridge Health"
        lead="Among the most comprehensive health systems in the region — and built on a simple promise: exceptional care should feel calm."
        crumbs={[{ label: 'About' }, { label: 'About Carebridge' }]}
        image="/images/health/doctor-team.jpg"
        actions={<Button to="/find-a-doctor" variant="inverse">Meet our clinicians</Button>}
      />

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink">{v.title}</h3>
              <p className="text-sm text-ink-secondary">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent"><Award className="h-3.5 w-3.5" /> Recognition</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">Ranked among the best — and accountable for it</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-secondary">
              We\u2019re consistently ranked #1 in the region for overall hospital care and named to the national honor
              roll. Our quality metrics — outcomes, safety and patient experience — are published and audited every year.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/community-equity" variant="outline">Community & equity</Button>
              <Button to="/news-and-insights" variant="outline">Latest research</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STATS.slice(0, 4).map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface-raised p-5 text-center">
                <p className="text-3xl font-bold tracking-tight text-accent">{s.value}</p>
                <p className="mt-1 text-xs text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-6">
          {STATS.slice(4).map((s) => (
            <div key={s.label} className="col-span-1 rounded-xl border border-line bg-surface-raised p-5 text-center lg:col-span-3">
              <p className="text-2xl font-bold tracking-tight text-accent">{s.value}</p>
              <p className="mt-1 text-xs text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <SectionHead title="Latest from the newsroom" sub="Fresh perspectives from our researchers and clinicians." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {db.news.slice(0, 3).map((n) => (
              <article key={n.id} className="rounded-xl border border-line bg-surface-raised p-5 transition-all hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">{n.category}</p>
                <h3 className="mt-2 font-semibold leading-snug text-ink">{n.title}</h3>
                <p className="mt-2 text-sm text-ink-secondary">{n.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;