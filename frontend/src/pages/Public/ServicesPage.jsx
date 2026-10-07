import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  HeartPulse, Activity, Brain, Baby, Stethoscope, Scale, HeartHandshake, Ribbon, ShieldCheck, CalendarCheck2, Sparkles,
  Scan, BrainCircuit,
} from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { PageHero } from '../../components/ui/Page.jsx';
import Button from '../../components/ui/Button.jsx';
import { SectionHead } from '../../components/shared/portal-common.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { Rating } from '../../components/shared/portal-common.jsx';

const ICON_BY_ID = {
  'sl-cancer': { icon: Ribbon, tone: 'red' },
  'sl-heart': { icon: HeartPulse, tone: 'blue' },
  'sl-neuro': { icon: Brain, tone: 'blue' },
  'sl-women': { icon: Baby, tone: 'teal' },
  'sl-ortho': { icon: Activity, tone: 'blue' },
  'sl-children': { icon: Stethoscope, tone: 'teal' },
  'sl-behavioral': { icon: Scale, tone: 'blue' },
  'sl-transplant': { icon: HeartHandshake, tone: 'teal' },
  'sl-headneck': { icon: Scan, tone: 'blue' },
  'sl-psychiatry': { icon: BrainCircuit, tone: 'blue' },
};

const RELATED_SPECIALTIES = {
  'sl-cancer': null,
  'sl-heart': 'spec-cardio',
  'sl-neuro': 'spec-neuro',
  'sl-women': 'spec-obgyn',
  'sl-ortho': 'spec-ortho',
  'sl-children': 'spec-pedia',
  'sl-behavioral': 'spec-behavioral',
  'sl-transplant': null,
  'sl-headneck': 'spec-pedia',
  'sl-psychiatry': 'spec-behavioral',
};

const DETAILS = {
  'sl-cancer': {
    intro: 'Comprehensive prevention, diagnosis, and treatment across every major cancer type — delivered by multidisciplinary teams who meet around your case.',
    highlights: ['Personalized tumor boards', 'Clinical trials from lab to bedside', 'Survivorship & nutrition programs'],
  },
  'sl-heart': {
    intro: 'From prevention and imaging to interventional cardiology and open-heart surgery, our cardiovascular program spans the entire continuum of care.',
    highlights: ['Preventive cardiology & rehab', 'Structural heart & electrophysiology', 'Advanced imaging'],
  },
  'sl-neuro': {
    intro: 'Specialists across neurology and neurosurgery treat everything from migraines to complex brain and spine conditions.',
    highlights: ['Comprehensive stroke center', 'Movement disorders clinic', 'Epilepsy monitoring unit'],
  },
  'sl-women': {
    intro: 'Coordinated care for every stage of life — obstetrics, gynecology, breast health, fertility and pelvic health.',
    highlights: ['Certified nurse-midwives', 'High-risk pregnancy program', 'Minimally invasive surgery'],
  },
  'sl-ortho': {
    intro: 'Bone, joint, spine and sports medicine — surgical and non-surgical paths designed around your activity goals.',
    highlights: ['Sports performance clinic', 'Joint preservation & replacement', 'Hand, foot & spine specialists'],
  },
  'sl-children': {
    intro: 'Pediatric experts from the newborn nursery through young adulthood, in spaces built around kids and families.',
    highlights: ['Level III NICU', 'Pediatric subspecialties in one place', 'Child life specialists'],
  },
  'sl-behavioral': {
    intro: 'Psychiatry, psychology and integrated behavioral health — for everyday stress through complex conditions.',
    highlights: ['Same-week intake for new patients', 'CBT, DBT and group programs', 'Adult and adolescent tracks'],
  },
  'sl-transplant': {
    intro: 'One of the most experienced transplant programs in the nation, with multidisciplinary care across 15 organ types.',
    highlights: ['Advanced heart & lung preservation', 'Living-donor programs', 'Long-term transplant wellness'],
  },
  'sl-headneck': {
    intro: 'Consultative and surgical care for conditions of the head, neck, ear, nose and throat — from hearing restoration to complex airway and tumor surgery — across all ages.',
    highlights: ['Multidisciplinary tumor board', 'Cochlear implant & hearing program', 'Minimally invasive endoscopic surgery'],
  },
  'sl-psychiatry': {
    intro: 'Specialized outpatient psychiatry programs ranked among the best in the nation, with dedicated tracks for mood, anxiety, eating and memory disorders.',
    highlights: ['Same-month intakes', 'Interventional psychiatry (TMS/ECT)', 'Inpatient & partial-hospital care'],
  },
};

const SERVICE_IMAGES = {
  'sl-cancer': '/images/health/cancer.jpg',
  'sl-heart': '/images/health/heart.jpg',
  'sl-neuro': '/images/health/neuro.jpg',
  'sl-women': '/images/health/pregnancy.jpg',
  'sl-ortho': '/images/health/physio.jpg',
  'sl-children': '/images/health/children.jpg',
  'sl-behavioral': '/images/health/behavioral.jpg',
  'sl-transplant': '/images/health/transplant.jpg',
  'sl-headneck': '/images/health/headneck.jpg',
  'sl-psychiatry': '/images/health/behavioral.jpg',
};

function ServiceLinesIndex() {
  const [db] = useDB();
  return (
    <>
      <PageHero
        title="Medical services"
        lead="Explore our service lines and specialty programs. Each brings together clinicians, researchers and support care."
        crumbs={[{ label: 'Find care' }, { label: 'Medical services' }]}
        image="/images/health/consult.jpg"
      />
      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {db.serviceLines.map((s) => {
            const meta = ICON_BY_ID[s.id] ?? { icon: HeartPulse, tone: 'blue' };
            const Icon = meta.icon;
            return (
              <Link key={s.id} to={`/services/${s.id.replace('sl-', '')}`} className="group flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold text-ink group-hover:text-accent">{s.name}</h3>
                <p className="text-sm text-ink-secondary">{s.desc}</p>
                <span className="mt-1 inline-flex items-center text-sm font-semibold text-accent">Explore →</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-line bg-surface-raised p-8">
          <SectionHead title="Looking for a specific department?" sub="Browse every clinical and academic department in our A–Z index." />
          <Button to="/departments" variant="outline">Open departments index</Button>
        </div>
      </section>
    </>
  );
}

function ServiceDetail() {
  const { id } = useParams();
  const [db] = useDB();
  const slId = `sl-${id}`;
  const service = db.serviceLines.find((s) => s.id === slId);
  if (!service) return <Navigate to="/services" replace />;

  const detail = DETAILS[slId] ?? { intro: service.desc, highlights: [] };
  const meta = ICON_BY_ID[slId] ?? { icon: HeartPulse, tone: 'blue' };
  const Icon = meta.icon;
  const relatedSpecialty = RELATED_SPECIALTIES[slId];
  const teams = relatedSpecialty
    ? Object.values(db.providers).filter((p) => p.specialty === relatedSpecialty)
    : [];
  const articles = db.healthLibrary.slice(0, 3);

  return (
    <>
      <PageHero
        title={service.name}
        lead={detail.intro}
        crumbs={[{ label: 'Medical services', to: '/services' }, { label: service.name }]}
        image={SERVICE_IMAGES[slId] ?? null}
        actions={
          <Button to={`/portal/patient/book?specialty=${relatedSpecialty ?? 'spec-primary'}`} variant="gold">Book an appointment</Button>
        }
      />
      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="rounded-xl border border-line bg-surface-raised p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-ink">What this program covers</h2>
                  <p className="text-sm text-ink-muted">{service.desc}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {detail.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-ink-secondary">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-surface-raised p-5">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <h3 className="mt-2 font-semibold text-ink">Quality & safety</h3>
                <p className="mt-1 text-sm text-ink-secondary">Outcomes are measured, published and reviewed by our clinical governance board quarterly.</p>
              </div>
              <div className="rounded-xl border border-line bg-surface-raised p-5">
                <CalendarCheck2 className="h-5 w-5 text-accent" />
                <h3 className="mt-2 font-semibold text-ink">Getting started</h3>
                <p className="mt-1 text-sm text-ink-secondary">New patients can book select clinicians online — usually within a week.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {teams.length > 0 && (
              <div className="rounded-xl border border-line bg-surface-raised p-5">
                <h3 className="mb-3 text-base font-semibold text-ink">Meet the team</h3>
                <div className="space-y-3">
                  {teams.map((p) => {
                    const user = db.users[p.userId];
                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        <Avatar name={`${user.firstName} ${user.lastName}`} size="md" src={user?.imageUrl} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">Dr. {user.firstName} {user.lastName}</p>
                          <Rating value={p.rating} count={p.reviews} />
                        </div>
                        <Button to={`/portal/patient/book?specialty=${p.specialty}&provider=${p.id}`} size="sm" variant="outline">
                          Book
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="rounded-xl border border-line bg-surface-raised p-5">
              <h3 className="mb-3 text-base font-semibold text-ink">Related health topics</h3>
              <ul className="space-y-2">
                {articles.map((a) => (
                  <li key={a.id}>
                    <Link to="/health-library" className="text-sm text-accent hover:text-accent-deep">→ {a.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ServicesPage() {
  const { id } = useParams();
  return id ? <ServiceDetail /> : <ServiceLinesIndex />;
}