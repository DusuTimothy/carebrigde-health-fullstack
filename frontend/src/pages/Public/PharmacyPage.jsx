import React, { useMemo, useState } from 'react';
import { Search, Truck, Store, ShieldCheck, ShoppingBag, Pill as PillIcon, Lock } from 'lucide-react';
import { PageHero } from '../../components/ui/Page.jsx';
import { Accordion } from '../../components/ui/Disclosure.jsx';
import Button from '../../components/ui/Button.jsx';
import Pill from '../../components/ui/Pill.jsx';
import { useDB } from '../../lib/db.js';
import { formatCurrency } from '../../lib/format.js';
import cn from '../../lib/cn.js';

const FAQ = [
  {
    id: 'f1',
    summary: 'Do I need to sign in to order medicines?',
    details: 'Yes — ordering requires a secure patient portal account so we can verify prescriptions and keep your health information protected. Public visitors can browse the full catalog and prices without an account.',
  },
  {
    id: 'f2',
    summary: 'Can I buy prescription medicines online?',
    details: 'Prescription-only items (marked "Rx") can only be ordered if there is a matching active prescription from your Carebridge clinician. Over-the-counter medicines, vitamins and first-aid items need no prescription.',
  },
  {
    id: 'f3',
    summary: 'How fast is delivery?',
    details: 'Orders placed before 5 pm are delivered same-day across Lagos in 1–3 hours. Pickup orders at Carebridge Pharmacy, Ikeja are typically ready in 30–60 minutes, and we text you when they are packed.',
  },
  {
    id: 'f4',
    summary: 'Is my health information safe?',
    details: 'Your order details are treated like medical records — transmitted over encrypted, NDPA-compliant connections and never sold. A licensed pharmacist reviews every ordered item before dispensing.',
  },
  {
    id: 'f5',
    summary: 'Do you accept HMO coverage for online orders?',
    details: 'Many HMO plans cover physician-prescribed medicines. After you place an order, our billing team can submit claims for prescription items on plans we support. OTC items are paid out of pocket.',
  },
];

const STEPS = [
  { icon: ShoppingBag, title: 'Browse the catalog', desc: 'Search medicines, vitamins and first-aid essentials with transparent Naira pricing.' },
  { icon: ShieldCheck, title: 'We verify your Rx', desc: 'A licensed pharmacist checks prescription items against your active prescriptions before dispensing.' },
  { icon: Truck, title: 'Delivered or ready to collect', desc: 'Same-day delivery across Lagos, or free pickup at Carebridge Pharmacy, Ikeja in under an hour.' },
];

export default function PharmacyPage() {
  const [db] = useDB();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const catalog = db.drugCatalog ?? [];
  const categories = useMemo(() => ['All', ...new Set(catalog.map((d) => d.category))], [catalog]);

  const featured = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((d) => {
      if (category !== 'All' && d.category !== category) return false;
      if (!q) return true;
      return [d.name, d.generic, d.form, d.strength, d.manufacturer, d.category].some((f) => f?.toLowerCase().includes(q));
    });
  }, [catalog, category, query]);

  return (
    <>
      <PageHero
        title="Buy medicines online"
        lead="Browse the Carebridge Pharmacy catalog and order for same-day delivery in Lagos or free pickup at the Ikeja store — from the comfort of home."
        crumbs={[{ label: 'Find care' }, { label: 'Buy drugs online' }]}
        image="/images/health/consult.jpg"
        actions={
          <Button to="/auth/login" variant="gold">
            Order in the portal <ShoppingBag className="h-4 w-4" />
          </Button>
        }
      />

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        {/* How it works */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-ink">
                <span className="mr-1 text-ink-muted">{i + 1}.</span> {s.title}
              </h3>
              <p className="text-sm text-ink-secondary">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Catalog */}
        <div className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink">The Carebridge Pharmacy catalog</h2>
              <p className="mt-1 text-sm text-ink-secondary">{featured.length} sample products with Naira pricing — sign in to place an order.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search medicines…"
                className="w-full rounded-lg border border-line bg-surface-raised py-2.5 pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25"
              />
            </div>
          </div>

          <div className="mt-4 flex min-w-0 gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  category === c ? 'border-accent bg-accent text-white' : 'border-line bg-neutral-50 text-ink-secondary hover:border-accent hover:text-accent'
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((d) => (
              <div key={d.id} className="flex flex-col rounded-xl border border-line bg-surface-raised p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-soft text-teal-deep">
                      <PillIcon className="h-5 w-5" />
                    </span>
                  )}
                  <Pill tone={d.requiresPrescription ? 'warning' : 'neutral'}>
                    {d.requiresPrescription ? 'Rx' : 'OTC'}
                  </Pill>
                </div>
                <p className="mt-3 text-sm font-bold text-ink">{d.name}</p>
                <p className="text-xs text-ink-muted">
                  {d.form} · {d.strength} · {d.pack}
                </p>
                <p className="mt-2 text-lg font-bold text-ink">{formatCurrency(d.price)}</p>
                <Button to="/auth/login" size="sm" variant="outline" className="mt-3">
                  <Lock className="h-3.5 w-3.5" /> Sign in to order
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-raised p-5">
            <Lock className="h-5 w-5 text-accent" />
            <p className="flex-1 text-sm text-ink-secondary">
              Signing in unlocks the full catalog, your active prescriptions, and cart-based checkout with delivery or pickup.
            </p>
            <Button to="/auth/login" size="sm">Open the patient portal</Button>
          </div>
        </div>

        {/* Delivery + pickup */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-navy-radial p-6 text-white">
            <Truck className="h-6 w-6 text-teal" />
            <h3 className="mt-3 font-semibold text-white">Same-day delivery</h3>
            <p className="mt-1 text-sm text-white/75">Across Lagos in 1–3 hours for ₦1,500. Order before 5 pm for delivery today.</p>
          </div>
          <div className="rounded-2xl bg-navy-radial p-6 text-white">
            <Store className="h-6 w-6 text-teal" />
            <h3 className="mt-3 font-semibold text-white">Free store pickup</h3>
            <p className="mt-1 text-sm text-white/75">Ready in 30–60 minutes at Carebridge Pharmacy, 9 Allen Avenue, Ikeja. We'll text you when it's packed.</p>
          </div>
          <div className="rounded-2xl bg-navy-radial p-6 text-white">
            <ShieldCheck className="h-6 w-6 text-teal" />
            <h3 className="mt-3 font-semibold text-white">Pharmacist-reviewed</h3>
            <p className="mt-1 text-sm text-white/75">Every Rx item is checked against your active prescriptions and allergies before it's dispensed.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">Ordering questions</h2>
          <Accordion items={FAQ} />
        </div>
      </section>
    </>
  );
}