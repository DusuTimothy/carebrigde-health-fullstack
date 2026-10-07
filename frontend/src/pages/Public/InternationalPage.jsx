import React from 'react';
import { Globe2, MapPin, CalendarDays, Laptop, PhoneCall, FileCheck2 } from 'lucide-react';
import { PageHero } from '../../components/ui/Page.jsx';
import Button from '../../components/ui/Button.jsx';
import { Accordion } from '../../components/ui/Disclosure.jsx';

const STEPS = [
  { icon: Globe2, title: 'Tell us about you', desc: 'Share your diagnosis, records and scheduling window through our secure intake form.' },
  { icon: FileCheck2, title: 'Records & clinical review', desc: 'Our coordinators gather and translate your records, then a physician reviews them.' },
  { icon: CalendarDays, title: 'Plan your visit', desc: 'Get a tailored schedule, cost estimate and travel guidance before you fly.' },
  { icon: Laptop, title: 'Virtual first, then in person', desc: 'Many patients start with a video consult, then come to us for procedures and follow-up.' },
];

const FAQ = [
  {
    id: 'i1',
    summary: 'How do you handle language during my visit?',
    details: 'Medical interpreters cover 10+ languages and are available in person, by phone or by video at no cost — for appointments, hospital stays and discharge instructions.',
  },
  {
    id: 'i2',
    summary: 'Do you help with visas, travel and lodging?',
    details: 'Our international team assists with the medical visa letter, airport coordination and discounted lodging at partner hotels and short-stay apartments.',
  },
  {
    id: 'i3',
    summary: 'How is the cost estimated?',
    details: 'We provide a written cost estimate after clinical review — transparent, itemized, and valid for 90 days so you can plan with confidence.',
  },
  {
    id: 'i4',
    summary: 'What happens after I return home?',
    details: 'We build a clear handoff plan with your local physician, arrange follow-up virtual visits, and stay reachable by a dedicated care coordinator.',
  },
];

function InternationalPage() {
  return (
    <>
      <PageHero
        title="International services"
        lead="Patients travel to Carebridge from more than 40 countries. We handle every detail — records, travel, language and follow-up — so you can focus on recovery."
        crumbs={[{ label: 'Patient resources' }, { label: 'International services' }]}
        image="/images/health/consult.jpg"
        actions={<Button variant="inverse">Send us your records</Button>}
      />

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-bold text-neutral-200">0{i + 1}</span>
              </div>
              <h3 className="font-semibold text-ink">{s.title}</h3>
              <p className="text-sm text-ink-secondary">{s.desc}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-line bg-surface-raised p-6">
            <h2 className="mb-3 text-xl font-bold text-ink">What we coordinate</h2>
            <ul className="space-y-3 text-sm text-ink-secondary">
              <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Airport pickup and accommodation guidance</li>
              <li className="flex gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Sequenced appointments across multiple specialists</li>
              <li className="flex gap-3"><Laptop className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Remote second opinions before you travel</li>
              <li className="flex gap-3"><PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> A dedicated coordinator on call 24/7</li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-surface-raised p-6">
            <h2 className="mb-3 text-xl font-bold text-ink">Get started</h2>
            <p className="text-sm text-ink-secondary">
              Complete our secure international intake and we\u2019ll respond within 2 business days. Please have your diagnosis summary and any recent imaging or labs ready to upload.
            </p>
            <form className="mt-4 space-y-3">
              <label htmlFor="intl-name" className="block text-sm font-medium text-ink">Full name</label>
              <input id="intl-name" placeholder="e.g. Sofia Alvarez" className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25" />
              <label htmlFor="intl-country" className="block text-sm font-medium text-ink">Country of origin</label>
              <input id="intl-country" placeholder="e.g. Mexico" className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25" />
              <label htmlFor="intl-email" className="block text-sm font-medium text-ink">Email</label>
              <input id="intl-email" type="email" placeholder="you@email.com" className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25" />
              <Button type="submit" block>Request a consultation</Button>
            </form>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">International FAQs</h2>
          <Accordion items={FAQ} />
        </div>
      </section>
    </>
  );
}

export default InternationalPage;