import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Phone } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { formatDate } from '../../lib/format.js';
import Button from '../../components/ui/Button.jsx';
import { IconTile } from '../../components/shared/portal-common.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { usePageMeta } from '../../lib/seo.js';
import { LazyBg } from '../../components/ui/Page.jsx';

/* Photo cards — modeled on the reference site's primary-care / immediate-care /
   locations / doctor / services / trials image grid. Images are vendored locally. */
const CARE_CARDS = [
  { img: '/images/health/primary-care.jpg', title: 'Primary Care', linkLabel: 'Find Primary Care', to: '/find-a-doctor?specialty=spec-primary' },
  { img: '/images/health/covid-test.jpg', title: 'Immediate Care', linkLabel: 'Find Immediate Care', to: '/find-a-location' },
  { img: '/images/health/hospital-corridor.jpg', title: 'Locations', linkLabel: 'See Our Locations', to: '/find-a-location' },
  { img: '/images/health/doctor-portrait1.jpg', title: 'Find a Doctor', linkLabel: 'Find a Doctor', to: '/find-a-doctor' },
  { img: '/images/health/surgery.jpg', title: 'Medical Services', linkLabel: 'Explore Medical Services', to: '/services' },
  { img: '/images/health/lab-2.jpg', title: 'Clinical Trials', linkLabel: 'Learn About Clinical Trials', to: '/clinical-trials' },
];

const WHY_CHOOSE = [
  { img: '/images/health/cancer.jpg', title: 'Cancer Care', linkLabel: 'Learn About Cancer Care', to: '/services/cancer-care' },
  { img: '/images/health/neuro.jpg', title: 'Neuroscience', linkLabel: 'Learn About Neuroscience', to: '/services/neuroscience' },
  { img: '/images/health/transplant.jpg', title: 'Transplant', linkLabel: 'Learn About Transplant', to: '/services/transplant' },
  { img: '/images/health/physio.jpg', title: 'Orthopedics & Sports Medicine', linkLabel: 'Learn About Orthopedics & Sports Medicine', to: '/services/orthopedics' },
  { img: '/images/health/heart.jpg', title: 'Heart & Vascular Care', linkLabel: 'Learn About Heart & Vascular Care', to: '/services/heart-vascular' },
  { img: '/images/health/headneck.jpg', title: 'Head & Neck Surgery', linkLabel: 'Learn About Head & Neck Surgery', to: '/services/head-neck-surgery' },
  { img: '/images/health/children.jpg', title: "Children's Care", linkLabel: "Learn About Children's Care", to: '/services/pediatric-care' },
  { img: '/images/health/pregnancy.jpg', title: "Women's Health", linkLabel: "Learn About Women's Health", to: '/services/womens-health' },
  { img: '/images/health/behavioral.jpg', title: 'Psychiatry', linkLabel: 'Learn About Psychiatry', to: '/services/psychiatry' },
];

const NEWS_IMAGES = {
  'n-1': '/images/health/heart.jpg',
  'n-2': '/images/health/neuro.jpg',
  'n-3': '/images/health/sports.jpg',
  'n-4': '/images/health/consult.jpg',
  'n-5': '/images/health/lab-2.jpg',
};

function PhotoCard({ img, title, linkLabel, to, className = '' }) {
  return (
    <Link
      to={to}
      className={`group relative block overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      <LazyBg image={img} className="media-tile media-edge aspect-[3/2] w-full" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-lg font-bold text-white drop-shadow md:text-xl">{title}</h3>
        <span className="mt-1.5 inline-flex items-center gap-0.5 text-sm font-semibold text-white/90 underline-offset-4 group-hover:text-white group-hover:underline">
          {linkLabel} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [db, dbActions] = useDB();
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  usePageMeta({
    description:
      'Carebridge Health provides world-class, compassionate medical care across Nigeria — find a doctor, book an appointment and manage your health from any device.',
  });

  const featured = db.news[0];
  const rest = db.news.slice(1, 5);

  function subscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    dbActions.subscribeNewsletter(email.trim());
    setDone(true);
    push('Subscribed', "You're on the list — welcome to Carebridge updates.");
  }

  return (
    <>
      {/* ================= 1 · HERO — photo + navy, serif headline ================= */}
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/health/doctor-portrait2.jpg)' }} />
        <div aria-hidden className="absolute inset-0 bg-primary-900/60" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-center px-4 py-20 md:px-6 md:py-28">
          <h1 className="font-display hero-shadow max-w-[20ch] text-5xl font-medium leading-[1.02] tracking-[-0.01em] md:text-6xl">
            Achieving the exceptional doesn't just happen
          </h1>
          <p className="hero-shadow mt-6 max-w-[58ch] text-lg leading-relaxed text-white/85 md:text-xl">
            Asking difficult questions, doggedly pursuing answers, making groundbreaking discoveries and providing
            exceptional care requires hard work. Instead of simply waiting for what's next, we shape it and create it.
            Because lives depend on it.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button to="/find-a-doctor" size="lg" variant="inverse">Find a Doctor</Button>
            <Button to="/find-a-location" size="lg" variant="outlineInverse">See Our Locations</Button>
          </div>
        </div>
      </section>

      {/* ================= 2 · "Your best care is closer than you think" ================= */}
      <section className="mx-auto mt-14 w-full max-w-6xl px-4 md:px-6">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
            Your best care is closer than you think
          </h2>
          <p className="mt-2 text-ink-secondary">
            From the Central Coast to the South Bay, we have more than 300 locations across the region.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARE_CARDS.map((c) => <PhotoCard key={c.title} {...c} />)}
        </div>
      </section>

      {/* ================= 3 · SPORTS FEATURE ================= */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-4 md:px-6">
        <div className="rounded-3xl bg-primary-900 p-8 py-14 text-white md:p-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Orthopedics & sports medicine</span>
            <h2 className="font-display mt-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Orthopedic and sports medicine care from pros
            </h2>
            <p className="mt-4 text-white/85">
              In a city where everyone — from skate queens to sunset chasers — moves with passion, injuries happen.
              From innovative therapies to advanced surgeries, Carebridge keeps the region in action.
            </p>
            <Button to="/services/orthopedics" variant="inverse" size="lg" className="mt-7">Find Orthopedic Care</Button>
          </div>
        </div>
      </section>

      {/* ================= 5 · WHY CHOOSE ================= */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-4 md:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Why Carebridge Health</p>
          <h2 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink md:text-4xl">
            Why choose Carebridge Health for medical care?
          </h2>
          <p className="mt-3 text-ink-secondary">
            When you visit Carebridge Health, you'll gain access to world-leading physicians, advanced technology and
            specialty services right in your own neighborhood.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE.map((c) => <PhotoCard key={c.title} {...c} />)}
        </div>
      </section>

      {/* ================= 6 · LATEST NEWS ================= */}
      {featured && (
        <section className="mt-16 bg-neutral-50 py-14">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">News & insights</p>
                <h2 className="font-display mt-1 text-3xl font-medium tracking-tight text-ink">Latest News</h2>
              </div>
              <Link to="/news-and-insights" className="inline-flex items-center gap-0.5 text-sm font-bold text-accent hover:text-accent-deep">
                View All News & Insights <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className="group col-span-full flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-sm transition-all hover:shadow-md sm:col-span-2 sm:row-span-2 lg:col-span-2">
                <LazyBg image={NEWS_IMAGES[featured.id] ?? '/images/health/doctor-team.jpg'} className="media-tile media-edge relative aspect-[16/9]" />
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <span className="w-fit rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                    {featured.category}
                  </span>
                  <h3 className="text-xl font-bold leading-snug text-ink group-hover:text-accent">{featured.title}</h3>
                  <p className="flex-1 text-sm text-ink-secondary">{featured.excerpt}</p>
                  <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <span>{formatDate(featured.date)}</span> · <span>{featured.readTime}</span>
                  </p>
                </div>
              </article>
              {rest.map((item) => (
                <article key={item.id} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <LazyBg image={NEWS_IMAGES[item.id] ?? '/images/health/consult.jpg'} className="media-tile media-edge relative aspect-[3/2]" />
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">{item.category}</p>
                    <h3 className="text-sm font-bold leading-snug text-ink group-hover:text-accent">{item.title}</h3>
                    <p className="mt-auto text-xs text-ink-muted">{formatDate(item.date)} · {item.readTime}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= 7 · STAY IN TOUCH ================= */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary-900 px-8 py-12 text-white md:px-12">
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-tight">Stay in Touch</h2>
              <p className="mt-2 max-w-[46ch] text-white/80">
                Subscribe to Carebridge newsletters and publications for the latest developments.
              </p>
            </div>
            <form onSubmit={subscribe} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input
                id="nl-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-w-0 flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/20"
              />
              <Button type="submit" variant="inverse" size="lg" className="shrink-0">
                {done ? 'Subscribed ✓' : 'Subscribe to Our Newsletter'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* ================= PATIENT SUPPORT STRIP ================= */}
      <section className="mx-auto mt-10 w-full max-w-6xl px-4 pb-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface-raised px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <IconTile icon={Phone} tone="blue" />
            <div>
              <p className="text-sm font-bold text-ink">Questions about a visit?</p>
              <p className="text-sm text-ink-muted">Our team is here 24/7 for appointments and billing.</p>
            </div>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-deep">
            Contact us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}