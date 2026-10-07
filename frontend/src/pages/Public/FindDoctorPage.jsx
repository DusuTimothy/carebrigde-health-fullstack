import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Languages, CheckCircle2 } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { PageHero, SearchBox } from '../../components/ui/Page.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Button from '../../components/ui/Button.jsx';
import { Rating, SectionHead } from '../../components/shared/portal-common.jsx';
import { Pagination } from '../../components/ui/Stepper.jsx';

const PAGE_SIZE = 6;

export default function FindDoctorPage() {
  const [db] = useDB();
  const [params, setParams] = useSearchParams();
  const [specialty, setSpecialty] = useState('all');
  const [newPatients, setNewPatients] = useState(false);
  const [bookOnline, setBookOnline] = useState(false);
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const q = params.get('search') ?? '';

  const providers = Object.values(db.providers);

  const filtered = useMemo(() => {
    let list = providers;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          `${db.users[p.userId]?.firstName} ${db.users[p.userId]?.lastName}`.toLowerCase().includes(needle) ||
          p.location.toLowerCase().includes(needle) ||
          p.specialtyName.toLowerCase().includes(needle) ||
          p.rating.toString().includes(needle) ||
          p.bio.toLowerCase().includes(needle)
      );
    }
    if (specialty !== 'all') list = list.filter((p) => p.specialty === specialty);
    if (newPatients) list = list.filter((p) => p.acceptsNewPatients);
    if (bookOnline) list = list.filter((p) => p.bookOnline);

    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'reviews') list = [...list].sort((a, b) => b.reviews - a.reviews);
    if (sort === 'name') list = [...list].sort((a, b) => a.specialtyName.localeCompare(b.specialtyName));
    return list;
  }, [providers, db.users, q, specialty, newPatients, bookOnline, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHero
        title="Find a doctor"
        lead="Search by specialty, name or need, then review real patient ratings and book a visit — most clinicians offer online scheduling."
        crumbs={[{ label: 'Find care' }, { label: 'Find a doctor' }]}
        image="/images/health/doctor-portrait1.jpg"
      >
        <div className="mt-8">
          <SearchBox
            value={q}
            onChange={(v) => {
              const next = new URLSearchParams(params);
              if (v) next.set('search', v);
              else next.delete('search');
              setParams(next, { replace: true });
              setPage(1);
            }}
            onSubmit={() => setPage(1)}
            placeholder="Search by name, specialty or condition — e.g. cardiology"
          />
        </div>
      </PageHero>

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        {/* Quick filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Pill tone={q === '' && specialty === 'all' && !newPatients && !bookOnline ? 'brand' : 'neutral'} className="cursor-pointer select-none" onClick={() => { const next = new URLSearchParams(params); next.delete('search'); setParams(next, { replace: true }); setSpecialty('all'); setNewPatients(false); setBookOnline(false); setPage(1); }}>
            See all ({providers.length})
          </Pill>
          <select
            aria-label="Filter by specialty"
            value={specialty}
            onChange={(e) => { setSpecialty(e.target.value); setPage(1); }}
            className="rounded-full border border-line bg-surface-raised px-3 py-1 text-xs font-medium text-ink-secondary focus:border-accent focus:outline-none"
          >
            <option value="all">All specialties</option>
            {db.bookingSpecialties.map((s) => (
              <option key={s.id} value={s.id}>{s.short}</option>
            ))}
          </select>
          <button
            aria-pressed={newPatients}
            onClick={() => { setNewPatients(!newPatients); setPage(1); }}
            className="rounded-full border border-line bg-surface-raised px-3 py-1 text-xs font-medium text-ink-secondary aria-pressed:bg-accent aria-pressed:text-white aria-pressed:border-accent"
          >
            Accepting new patients
          </button>
          <button
            aria-pressed={bookOnline}
            onClick={() => { setBookOnline(!bookOnline); setPage(1); }}
            className="rounded-full border border-line bg-surface-raised px-3 py-1 text-xs font-medium text-ink-secondary aria-pressed:bg-accent aria-pressed:text-white aria-pressed:border-accent"
          >
            Books online
          </button>
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="sort" className="text-xs text-ink-muted">Sort by</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-line bg-surface-raised px-2 py-1 text-xs font-medium text-ink-secondary focus:border-accent focus:outline-none"
            >
              <option value="rating">Highest rated</option>
              <option value="reviews">Most reviews</option>
              <option value="name">Specialty A–Z</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {pageRows.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface-raised py-16 text-center">
            <p className="font-semibold text-ink">No clinicians match those filters</p>
            <p className="mt-1 text-sm text-ink-muted">Try clearing a filter or searching a broader term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pageRows.map((p) => {
              const user = db.users[p.userId];
              const fullName = `Dr. ${user.firstName} ${user.lastName}`;
              return (
                <article key={p.id} className="flex flex-col gap-4 rounded-xl border border-line bg-surface-raised p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <Avatar name={fullName} size="lg" src={user?.imageUrl || p.imageUrl} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold text-ink">{fullName}</h3>
                      <p className="text-sm text-ink-secondary">{p.specialtyName} · {p.location}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Rating value={p.rating} count={p.reviews} />
                        <span className="text-xs text-ink-muted">{p.title}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-ink-secondary">{p.bio}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-ink-muted">
                      <Languages className="h-3.5 w-3.5" /> {p.languages.join(', ')}
                    </div>
                    {p.acceptsNewPatients && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success-ink">
                        <CheckCircle2 className="h-3.5 w-3.5" /> New patients
                      </span>
                    )}
                    {p.bookOnline && (
                      <div className="ml-auto">
                        <Button to={`/portal/patient/book?specialty=${p.specialty}&provider=${p.id}`} size="sm">
                          Book a visit
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="mt-6">
            <Pagination page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} pageSize={PAGE_SIZE} />
          </div>
        )}

        {/* Help strip */}
        <div className="mt-12 rounded-2xl border border-line bg-surface-raised p-8">
          <SectionHead
            title="Not sure where to start?"
            sub="Our primary care team can see you in person or by video — most visits are bookable today."
          />
          <div className="flex flex-wrap gap-3">
            <Button to="/portal/patient/book?specialty=spec-primary">Book primary care</Button>
            <Button to="/virtual-care" variant="outline">Learn about virtual care</Button>
            <Button to="/find-a-location" variant="outline">See locations</Button>
          </div>
        </div>
      </section>
    </>
  );
}