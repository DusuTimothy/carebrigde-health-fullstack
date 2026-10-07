import React, { useMemo, useState } from 'react';
import { MapPin, Phone, Clock, Hospital, Building2, Ambulance, ScanLine } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { PageHero, SearchBox } from '../../components/ui/Page.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Button from '../../components/ui/Button.jsx';
import { Pagination } from '../../components/ui/Stepper.jsx';

const TYPE_META = {
  Hospital: { icon: Hospital, tone: 'info' },
  'Primary Care': { icon: Building2, tone: 'brand' },
  'Immediate Care': { icon: Ambulance, tone: 'warning' },
  'Specialty Care': { icon: Building2, tone: 'teal' },
  Imaging: { icon: ScanLine, tone: 'gray' },
  Pharmacy: { icon: Building2, tone: 'neutral' },
};

const PAGE_SIZE = 6;

export default function FindLocationPage() {
  const [db] = useDB();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = db.locations;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(needle) ||
          l.address.toLowerCase().includes(needle) ||
          l.services.some((s) => s.toLowerCase().includes(needle))
      );
    }
    if (type !== 'all') list = list.filter((l) => l.type === type);
    return list;
  }, [db.locations, q, type]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHero
        title="Find a location"
        lead="From urgent care and primary care to full-service hospitals — 300+ locations across the region."
        crumbs={[{ label: 'Find care' }, { label: 'Find a location' }]}
        image="/images/health/hospital-corridor.jpg"
      >
        <div className="mt-8">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} onSubmit={() => setPage(1)} placeholder="Search by location name, city or service — e.g. urgent care" />
        </div>
      </PageHero>

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Pill tone={type === 'all' ? 'brand' : 'neutral'} className="cursor-pointer" onClick={() => { setType('all'); setPage(1); }}>
            All ({db.locations.length})
          </Pill>
          {Object.keys(TYPE_META).map((t) => (
            <Pill key={t} tone={type === t ? 'brand' : 'neutral'} className="cursor-pointer" onClick={() => { setType(t); setPage(1); }}>
              {t} ({db.locations.filter((l) => l.type === t).length})
            </Pill>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pageRows.map((loc) => {
            const meta = TYPE_META[loc.type] ?? { icon: Building2, tone: 'gray' };
            const Icon = meta.icon;
            return (
              <article key={loc.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{loc.name}</h3>
                      <Pill tone={meta.tone} className="mt-1">{loc.type}</Pill>
                    </div>
                  </div>
                </div>
                <ul className="space-y-1.5 text-sm text-ink-secondary">
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" /> {loc.address}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-ink-muted" /> {loc.phone}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-ink-muted" /> {loc.hours}
                  </li>
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {loc.services.map((s) => (
                    <Pill key={s} tone="neutral" className="text-[11px]">{s}</Pill>
                  ))}
                </div>
                <div className="mt-auto flex gap-2 pt-1">
                  <Button to={`/portal/patient/book?guest=1`} size="sm" variant="outline" className="flex-1">
                    Book at this location
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => {}}>
                    Get directions
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="mt-6">
            <Pagination page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} pageSize={PAGE_SIZE} />
          </div>
        )}
      </section>
    </>
  );
}