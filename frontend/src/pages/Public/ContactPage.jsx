import React, { useState } from 'react';
import { PhoneCall, Mail, MessageCircle, Building2 } from 'lucide-react';
import { PageHero } from '../../components/ui/Page.jsx';
import Button from '../../components/ui/Button.jsx';
import Input, { Textarea } from '../../components/ui/Input.jsx';
import { useDB } from '../../lib/db.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatTime } from '../../lib/format.js';

const CHANNELS = [
  { icon: PhoneCall, title: 'Phone', lines: [['Main switchboard', '+234 1 270 0100'], ['Appointments', '+234 1 270 0123'], ['International desk', '+234 1 270 0170']] },
  { icon: MessageCircle, title: 'Portal messaging', lines: [['Secure messages', 'In the patient portal, 24/7'], ['Video visit support', '+234 1 270 0127']] },
  { icon: Mail, title: 'Send a note', lines: [['Patients & visitors', 'patients@carebridge.ng'], ['Media inquiries', 'press@carebridge.ng']] },
];

function ContactPage() {
  const [db] = useDB();
  const { push } = useToast();
  const [form, setForm] = useState({ name: '', email: '', topic: 'Billing, insurance & financial assistance', message: '' });

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      push('Almost there', 'Please fill in your name, email and message.', 'warning');
      return;
    }
    push('Message sent', 'This is a demo — your note was received by the mock system.');
    setForm({ name: '', email: '', topic: form.topic, message: '' });
  }

  return (
    <>
      <PageHero
        title="Contact us"
        lead="We\u2019re here 24/7 for urgent needs, and our call center answers non-urgent questions every day."
        crumbs={[{ label: 'About' }, { label: 'Contact us' }]}
        image="/images/health/doctor-portrait2.jpg"
      />

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {CHANNELS.map((c) => (
            <div key={c.title} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink">{c.title}</h3>
              <dl className="flex-1 space-y-2 text-sm">
                {c.lines.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-ink-muted">{k}</dt>
                    <dd className="font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={submit} className="rounded-2xl border border-line bg-surface-raised p-6">
            <h2 className="mb-4 text-xl font-bold text-ink">Send us a message</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="contact-topic">Topic</label>
              <select id="contact-topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full appearance-none rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink">
                {['Billing, insurance & financial assistance', 'Appointments & referrals', 'Medical records', 'International services', 'Media inquiry', 'Something else'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <Textarea label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={`For urgent medical needs, call +234 1 270 0100.\nDo not use this form for emergencies — dial 112.`} rows={5} />
            </div>
            <Button type="submit" className="mt-4">Send message</Button>
          </form>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-line bg-surface-raised p-5">
              <h3 className="mb-2 font-semibold text-ink">Urgent?</h3>
              <p className="text-sm text-ink-secondary">For a medical emergency, call <strong>112</strong>. For same-day concerns, use our virtual care queue instead of email.</p>
            </div>
            <div className="rounded-xl bg-primary-900 p-5 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                <Building2 className="h-5 w-5 text-teal" />
              </span>
              <h3 className="mt-3 font-semibold text-white">Visiting hours</h3>
              <p className="mt-1 text-sm text-white/80">General visiting hours are 9 a.m. – 8 p.m. daily. Labor & Delivery welcomes support persons 24/7. Confirm hours with the unit before you visit.</p>
              <p className="mt-3 text-xs text-white/60">First available time slots start at {formatTime('08:30')} on weekdays.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactPage;