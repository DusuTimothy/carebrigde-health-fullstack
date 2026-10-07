import React, { useState } from 'react';
import { Gift, Repeat, CalendarHeart, Heart } from 'lucide-react';
import { PageHero } from '../../components/ui/Page.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import CardForm from '../../components/ui/CardForm.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const WAYS = [
  { icon: Gift, title: 'Give now', linkLabel: 'Donate once', desc: 'One-time gifts fund everything from new imaging equipment to community screening.' },
  { icon: Repeat, title: 'Give monthly', linkLabel: 'Donate monthly', desc: 'Sustaining gifts create predictable support for our mobile care programs.' },
  { icon: CalendarHeart, title: 'Honor & memorial', linkLabel: 'Honor someone', desc: 'Celebrate a loved one or caregiver with a gift in their name.' },
  { icon: Heart, title: 'Planned giving', linkLabel: 'Plan a gift', desc: 'Leave a legacy through your will, trust or life insurance policy.' },
];

function DonatePage() {
  const { push } = useToast();
  const { requireReAuth } = useAuth();
  const [step, setStep] = useState('choose');
  const [frequency, setFrequency] = useState('once');
  const [honor, setHonor] = useState(false);
  const [amount, setAmount] = useState('');
  const [donor, setDonor] = useState({ name: '', email: '', phone: '' });
  const [pendingToken, setPendingToken] = useState(null);

  const numericAmount = Number(String(amount).replace(/[^0-9.]/g, ''));

  function startCheckout(e) {
    e.preventDefault();
    if (!donor.name || !donor.email || !numericAmount) {
      push('Almost there', 'Please fill in name, email and an amount.', 'warning');
      return;
    }
    setStep('pay');
  }

  async function handleToken(token) {
    /* Email is used only for OTP delivery + tax receipt. The card is the
       payment instrument — no email-based "pay by link" flow. */
    setPendingToken(token);
    const ok = await requireReAuth(`Confirm donation of $${numericAmount} to ${token.brand} •••• ${token.last4}`);
    if (!ok) return;
    setStep('done');
    push('Thank you!', `Your ${frequency === 'monthly' ? 'monthly ' : ''}gift of $${numericAmount} was charged to ${token.brand} ending ${token.last4}. A receipt has been emailed to ${donor.email}.`, 'success');
  }

  function reset() {
    setStep('choose');
    setFrequency('once');
    setHonor(false);
    setAmount('');
    setDonor({ name: '', email: '', phone: '' });
    setPendingToken(null);
  }

  return (
    <>
      <PageHero
        title="Donate"
        lead="Your generosity funds research, community clinics and the technology that lets us care for more people, more calmly."
        crumbs={[{ label: 'About' }, { label: 'Donate' }]}
        image="/images/health/doctor-team.jpg"
      />
      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {WAYS.map((w) => (
            <button
              key={w.title}
              type="button"
              onClick={() => {
                setFrequency(w.title === 'Give monthly' ? 'monthly' : 'once');
                setStep('form');
              }}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface-raised p-5 text-left transition-colors hover:border-accent hover:bg-accent-soft/30"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-soft text-teal-deep">
                <w.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink">{w.title}</h3>
              <p className="text-sm text-ink-secondary">{w.desc}</p>
              <span className="text-xs font-bold uppercase tracking-wide text-accent">{w.linkLabel} →</span>
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Where your money goes</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-secondary">
              <li className="flex gap-3"><Heart className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> 100% of designated gifts go to the area you choose</li>
              <li className="flex gap-3"><Heart className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Unrestricted gifts power our charity care fund</li>
              <li className="flex gap-3"><Heart className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Every gift is acknowledged with a receipt for tax purposes</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-surface-raised p-6">
            {step === 'choose' && (
              <>
                <h3 className="mb-1 text-xl font-bold text-ink">Make a gift</h3>
                <p className="mb-5 text-sm text-ink-secondary">Pick a frequency and amount to get started.</p>
                <div className="grid grid-cols-2 gap-2">
                  {['once', 'monthly'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={frequency === f
                        ? 'rounded-lg border-2 border-accent bg-accent-soft px-3 py-3 text-sm font-semibold text-accent'
                        : 'rounded-lg border border-line px-3 py-3 text-sm font-medium text-ink-secondary hover:border-accent'}
                    >
                      {f === 'once' ? 'One-time' : 'Monthly'}
                    </button>
                  ))}
                </div>
                <div className="mt-5">
                  <span className="mb-1.5 block text-sm font-medium text-ink">Amount (USD)</span>
                  <div className="grid grid-cols-4 gap-2">
                    {['25', '50', '100', '250'].map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAmount(a)}
                        className={amount === a
                          ? 'rounded-lg border-2 border-accent bg-accent-soft px-2 py-2 text-sm font-semibold text-accent'
                          : 'rounded-lg border border-line px-2 py-2 text-sm font-medium text-ink-secondary hover:border-accent'}
                      >
                        ${a}
                      </button>
                    ))}
                  </div>
                  <input
                    className="mt-2 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25"
                    placeholder="Or enter custom amount"
                    value={amount && ['25', '50', '100', '250'].includes(amount) ? '' : amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    inputMode="decimal"
                  />
                </div>
                <label className="mt-5 flex cursor-pointer items-start gap-2 text-sm text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={honor}
                    onChange={(e) => setHonor(e.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px] accent-accent"
                  />
                  <span>Make this gift in honor or memory of someone</span>
                </label>
                <Button block size="lg" className="mt-5" onClick={() => setStep('form')}>
                  Continue
                </Button>
              </>
            )}

            {step === 'form' && (
              <form onSubmit={startCheckout}>
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-ink">Your details</h3>
                  <button type="button" onClick={() => setStep('choose')} className="text-xs font-semibold text-accent hover:text-accent-deep">
                    ← Back
                  </button>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Full name"
                    value={donor.name}
                    onChange={(e) => setDonor({ ...donor, name: e.target.value })}
                    placeholder="First and last name"
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={donor.email}
                    onChange={(e) => setDonor({ ...donor, email: e.target.value })}
                    placeholder="you@email.com"
                    hint="We'll send your tax receipt and a one-time code to confirm the charge."
                    required
                  />
                  <Input
                    label="Phone (optional)"
                    type="tel"
                    value={donor.phone}
                    onChange={(e) => setDonor({ ...donor, phone: e.target.value })}
                    placeholder="For donation questions"
                  />
                  {honor && (
                    <Input
                      label="In honor of"
                      placeholder="Name of the person you're honoring"
                      required
                    />
                  )}
                  <div className="rounded-lg bg-neutral-50 p-3 text-sm text-ink-secondary">
                    <p className="flex justify-between">
                      <span>{frequency === 'monthly' ? 'Monthly gift' : 'One-time gift'}</span>
                      <span className="font-bold text-ink">${numericAmount || '0'}</span>
                    </p>
                  </div>
                  <Button type="submit" block size="lg">
                    Continue to payment
                  </Button>
                </div>
              </form>
            )}

            {step === 'pay' && (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-ink">Payment</h3>
                  <button type="button" onClick={() => setStep('form')} className="text-xs font-semibold text-accent hover:text-accent-deep">
                    ← Back
                  </button>
                </div>
                <CardForm
                  amount={numericAmount}
                  defaultName={donor.name}
                  onTokenise={handleToken}
                  onCancel={() => setStep('form')}
                  submitLabel="Donate"
                />
              </>
            )}

            {step === 'done' && (
              <div className="space-y-4 py-4 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success-ink">
                  <Heart className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-bold text-ink">Thank you for your gift</h3>
                <p className="text-sm text-ink-secondary">
                  Your ${numericAmount} {frequency === 'monthly' ? 'monthly ' : ''}donation to Carebridge Health is on its way.
                  A receipt has been emailed to <strong>{donor.email}</strong>.
                </p>
                <Button onClick={reset} variant="outline" size="md">Make another gift</Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default DonatePage;