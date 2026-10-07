import React, { useState } from 'react';
import { MonitorPlay, FileText, CalendarClock, Camera, LifeBuoy } from 'lucide-react';
import { PageHero } from '../../components/ui/Page.jsx';
import Button from '../../components/ui/Button.jsx';
import { Accordion } from '../../components/ui/Disclosure.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const OPTIONS = [
  {
    id: 'immediate',
    icon: LifeBuoy,
    title: 'Immediate care, virtually',
    desc: 'Connect with a clinician in minutes for colds, fevers, rashes and minor injuries. Join the virtual queue and you\'ll see your wait time.',
    cta: 'Join the virtual queue',
  },
  {
    id: 'scheduled',
    icon: MonitorPlay,
    title: 'Video visit with your care team',
    desc: 'A scheduled face-to-face video visit with your primary or specialty clinician — perfect for follow-ups and medication reviews.',
    cta: 'Book a video visit',
  },
  {
    id: 'evisit',
    icon: FileText,
    title: 'E-visit',
    desc: 'Answer a secure questionnaire; a clinician reviews it and sends a diagnosis and treatment plan within 24 hours.',
    cta: 'Start an E-visit',
  },
  {
    id: 'second-opinion',
    icon: CalendarClock,
    title: 'Second opinion consult',
    desc: 'Get an independent expert review of a diagnosis or treatment plan via secure video conferencing.',
    cta: 'Request a second opinion',
  },
];

const FAQ = [
  {
    id: 'f1',
    summary: 'When should I use virtual care instead of an in-person visit?',
    details: 'Virtual care works well for follow-up visits, medication reviews, lab-result conversations, minor rashes, allergies and second opinions. In-person care is better for physical exams, vaccinations, procedures and anything heart- or lung-related that requires listening to your chest. When in doubt, book a video visit and your clinician will tell you if you need to come in.',
  },
  {
    id: 'f2',
    summary: 'Do I need any special equipment?',
    details: 'Just a computer, smartphone or tablet with a camera and microphone and a stable internet connection. We support all modern browsers.',
  },
  {
    id: 'f3',
    summary: 'Is virtual care secure?',
    details: 'Yes. Video visits use encrypted, NDPA-compliant connections, and every message in the portal is protected like your medical record.',
  },
  {
    id: 'f4',
    summary: 'Will my insurance cover a video visit?',
    details: 'Most major plans cover telehealth at the same rate as an in-person visit. Some preventive services must be delivered in person — your care team can confirm what applies to you.',
  },
  {
    id: 'f5',
    summary: 'What if I have technical trouble during the visit?',
    details: 'Your portal support line — +234 1 270 0127 — is available 24/7, and our technical guide walks through camera, microphone and connection fixes.',
  },
];

export default function VirtualCarePage() {
  const { push } = useToast();
  const [notice, setNotice] = useState(null);

  return (
    <>
      <PageHero
        title="Virtual care"
        lead="Skip the waiting room. Connect with a Carebridge clinician from your couch, desk or car — on your schedule."
        crumbs={[{ label: 'Find care' }, { label: 'Virtual care' }]}
        image="/images/health/telehealth.jpg"
        actions={
          <Button to="/portal/patient/book?guest=1&mode=video" variant="gold">Book a video visit</Button>
        }
      />

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {OPTIONS.map((o) => (
            <div key={o.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-6 transition-all hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <o.icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-ink">{o.title}</h3>
              <p className="flex-1 text-sm text-ink-secondary">{o.desc}</p>
              <Button
                variant={o.id === 'immediate' ? 'secondary' : 'outline'}
                onClick={() => {
                  setNotice(o);
                  push(o.id === 'immediate' ? 'Virtual queue joined' : 'Demo flow', `${o.title} is wired into the booking flow in the portal. Open the portal and pick a provider to try it.`, 'info');
                }}
              >
                {o.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface-raised p-6">
          <Camera className="h-8 w-8 text-accent" />
          <div className="flex-1">
            <h3 className="font-semibold text-ink">What you need for a video visit</h3>
            <p className="text-sm text-ink-secondary">A device with camera + microphone, stable internet, and a quiet, well-lit space. Join up to 10 minutes early.</p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">Frequently asked questions</h2>
          <Accordion items={FAQ} />
        </div>
      </section>
    </>
  );
}