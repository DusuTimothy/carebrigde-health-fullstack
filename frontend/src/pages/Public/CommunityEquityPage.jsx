import React from 'react';
import { HandHeart, Truck, Users2, Speech } from 'lucide-react';
import { PageHero } from '../../components/ui/Page.jsx';
import Button from '../../components/ui/Button.jsx';
import { SectionHead } from '../../components/shared/portal-common.jsx';
import { useDB } from '../../lib/db.js';

const ICONS = { 'Mobile Care Unit': Truck, 'Community Health Workers': Users2, 'Homeless Healthcare Collaborative': HandHeart, 'Translation & Health Literacy': Speech };

function CommunityEquityPage() {
  const [db] = useDB();
  return (
    <>
      <PageHero
        title="Community & equity"
        lead={db.community.mission}
        crumbs={[{ label: 'About' }, { label: 'Community & equity' }]}
        image="/images/health/nurses.jpg"
        actions={<Button variant="inverse">Get involved</Button>}
      />

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {db.community.programs.map((p) => {
            const Icon = ICONS[p.name] ?? HandHeart;
            return (
              <article key={p.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-5 transition-all hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-soft text-teal-deep">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-ink">{p.name}</h3>
                <p className="flex-1 text-sm text-ink-secondary">{p.desc}</p>
                <p className="text-xs text-ink-muted">{p.participants.toLocaleString()} people served to date</p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-line bg-surface-raised p-6">
            <SectionHead title="Why access matters" />
            <p className="text-sm leading-relaxed text-ink-secondary">
              Health outcomes track postcode more closely than genetic code. Untreated hypertension, diabetes and
              mental health conditions shorten lives decades early in the neighborhoods around our hospitals.
              Our equity strategy starts where the gaps are: mobile screening units on fixed weekly routes,
              community health workers embedded with local clinics, and street medicine for unsheltered neighbors.
            </p>
            <div className="mt-6">
              <Button variant="outline">Read our community benefit report</Button>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-xl bg-primary-900 p-6 text-white">
            <div>
              <h3 className="text-xl font-bold text-white">Find resources near you</h3>
              <p className="mt-2 text-sm text-white/80">
                Community food pantries, free clinics, housing support and navigation services — searchable by ZIP code.
              </p>
            </div>
            <form className="mt-6 flex gap-2">
              <label htmlFor="zip" className="sr-only">Postcode</label>
              <input id="zip" placeholder="Enter postcode" inputMode="numeric" pattern="[0-9]{6}" className="w-full rounded-lg border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/25" />
              <Button type="submit" variant="secondary">Search</Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default CommunityEquityPage;