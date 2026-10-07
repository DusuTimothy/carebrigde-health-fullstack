import React, { useState } from 'react';
import { Phone, MessageSquare, LifeBuoy, FileText, ShieldCheck, Activity } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { Textarea } from '../../components/ui/Input.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

function HelpPage() {
  const { push } = useToast();
  const [box, setBox] = useState('');

  const channels = [
    { icon: Phone, title: 'Call the help desk', desc: 'Available 24/7 for portal and account help.', value: '+234 1 270 0100', tone: 'bg-accent-soft text-accent' },
    { icon: MessageSquare, title: 'Secure message', desc: 'Non-urgent portal questions answered within 1 business day.', value: 'Via your care team', tone: 'bg-teal-soft text-teal-deep' },
    { icon: LifeBuoy, title: 'Video support', desc: 'Screen-share with a support agent, Mon–Fri 8 am – 6 pm.', value: 'Join the queue', tone: 'bg-warning-soft text-warning-ink' },
  ];

  const faqs = [
    ['How do I book a video visit?', 'Open Book a visit from the top navigation, choose a clinician and time, then pick "Video visit". You will get a secure link in the portal 15 minutes before the start time.'],
    ['How do I view my lab results?', 'Select Lab results from the navigation. Final results appear automatically; your clinician will flag anything that needs follow-up.'],
    ['How does the refill process work?', 'On the Prescriptions page tap Request refill. Your care team reviews it (usually within 2 business days) and sends it to your pharmacy on file.'],
    ['Is my health data private?', 'Yes. All data is encrypted in transit and at rest, access is audited, and we never sell your information. See your Privacy settings for full details.'],
    ['What should I do in a medical emergency?', 'If this is an emergency, call 112 or go to your nearest emergency department. This portal is not for urgent or emergency medical needs.'],
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Help & support</h1>
        <p className="mt-1 text-sm text-ink-secondary">Find answers fast, or talk to a real person when you need to.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {channels.map(({ icon: Icon, title, desc, value, tone }) => (
          <Card key={title}>
            <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-xs text-ink-secondary">{desc}</p>
            <p className="mt-2 text-sm font-bold text-accent">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHead title="Frequently asked questions" />
        <div className="divide-y divide-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink">
                {q}
                <span className="text-ink-muted transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{a}</p>
            </details>
          ))}
        </div>
      </Card>

      <div className="rounded-2xl bg-navy-radial p-6 text-white md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ShieldCheck className="h-5 w-5 text-gold-200" /> Still need a hand?
            </h3>
            <p className="mt-1 max-w-xl text-sm text-white/75">
              Tell us what you are trying to do and a support agent will reply to your secure portal mailbox.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Average reply under 2 hours</span>
              <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> Health data never screenshotted</span>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!box.trim()) return;
              push('Message sent', 'Our support team will reply in your portal mailbox.', 'success');
              setBox('');
            }}
            className="w-full max-w-sm"
          >
            <Textarea rows={4} value={box} onChange={(e) => setBox(e.target.value)} placeholder="How can we help? No medical advice, please." />
            <Button type="submit" className="mt-2 w-full" disabled={!box.trim()}>Send support message</Button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        For medical questions unrelated to the portal, use Secure message with your care team. In an emergency call 112.
      </p>
    </div>
  );
}

export default HelpPage;