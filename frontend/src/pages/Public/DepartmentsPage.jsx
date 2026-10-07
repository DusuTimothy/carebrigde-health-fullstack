import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDB } from '../../lib/db.js';
import { PageHero, SearchBox } from '../../components/ui/Page.jsx';
import { useState } from 'react';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function DepartmentsPage() {
  const [db] = useDB();
  const [q, setQ] = useState('');
  const [anchor, setAnchor] = useState(null);

  const filtered = useMemo(() => {
    let list = db.departments;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(needle));
    }
    return list;
  }, [db.departments, q]);

  const byLetter = LETTERS.split('').map((L) => ({
    letter: L,
    items: filtered.filter((d) => L === '#' ? false : d.letter === L),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHero
        title="Departments index"
        lead="Every clinical and academic department — browse A to Z or search by name."
        crumbs={[{ label: 'About' }, { label: 'Departments index' }]}
        image="/images/health/hospital-corridor.jpg"
      >
        <div className="mt-8">
          <SearchBox value={q} onChange={setQ} onSubmit={() => {}} placeholder="Search departments — e.g. neurology" />
        </div>
      </PageHero>

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <nav aria-label="Alphabet index" className="mb-8 flex flex-wrap gap-1.5">
          {LETTERS.split('').map((L) => {
            const has = filtered.some((d) => d.letter === L && !q.trim());
            return (
              <a
                key={L}
                href={`#dept-${L}`}
                onClick={() => setAnchor(L)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border border-line text-sm font-semibold transition-colors ${
                  anchor === L ? 'border-accent bg-accent text-white' : has ? 'text-ink-secondary hover:border-accent hover:text-accent' : 'text-ink-muted/40 cursor-not-allowed'
                }`}
              >
                {L}
              </a>
            );
          })}
        </nav>

        {byLetter.length === 0 && (
          <div className="rounded-xl border border-line bg-surface-raised py-16 text-center text-sm text-ink-muted">
            No departments match “{q}”.
          </div>
        )}

        {byLetter.map((g) => (
          <section key={g.letter} id={`dept-${g.letter}`} className="mb-8 scroll-mt-24">
            <h2 className="mb-3 border-b-2 border-primary-100 pb-2 text-xl font-semibold text-accent">{g.letter}</h2>
            <div className="flex flex-wrap gap-2">
              {g.items.map((d) => (
                <Link key={d.name} to="/find-a-doctor" className="rounded-lg border border-line bg-surface-raised px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent">
                  {d.name}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </section>
    </>
  );
}