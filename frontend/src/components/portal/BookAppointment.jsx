import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, Clock, CheckCircle2, Video, Building, ChevronLeft, ShieldCheck } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import { slotTimesFor, slotTimeToString, slotTimeToDate } from '../../lib/seed.js';
import { Stepper } from '../ui/Stepper.jsx';
import Button from '../ui/Button.jsx';
import Input, { Textarea } from '../ui/Input.jsx';
import Pill from '../ui/Pill.jsx';
import Alert from '../ui/Alert.jsx';
import { Rating } from '../shared/portal-common.jsx';
import { formatDate, formatDayName, formatTime, formatCurrency } from '../../lib/format.js';
import { LogoMark } from '../layout/PublicHeader.jsx';

const STEPS = [
  { id: 'specialty', label: 'Choose specialty' },
  { id: 'time', label: 'Doctor & time' },
  { id: 'confirm', label: 'Confirm & book' },
];

const DAYS = [0, 1, 2, 3, 4];

/**
 * Three-step booking flow. Renders inside the patient portal when logged in,
 * or standalone as a guest flow (guestMode) with its own minimal header.
 */
export default function BookAppointment({ guestMode = false }) {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const [params] = useSearchParams();

  const [step, setStep] = useState(0);
  const [specialty, setSpecialty] = useState(params.get('specialty') ?? '');
  const [providerId, setProviderId] = useState(params.get('provider') ?? '');
  const [dayOffset, setDayOffset] = useState(0);
  const [slotTime, setSlotTime] = useState(null);

  const [type, setType] = useState(params.get('mode') === 'video' ? 'video' : 'in-person');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const [guest, setGuest] = useState({ name: '', phone: '', dob: '', email: '' });
  const [booked, setBooked] = useState(null);

  const specialties = db.bookingSpecialties;
  const feeSpec = specialties.find((s) => s.id === specialty);
  const feeRange = (s) => (s?.feeMin ? `${formatCurrency(s.feeMin)} – ${formatCurrency(s.feeMax)} (self-pay)` : '');
  const providers = useMemo(
    () => Object.values(db.providers).filter((p) => p.specialty === specialty),
    [db.providers, specialty]
  );
  const provider = providerId ? db.providers[providerId] : null;
  const providerFullName = (p) => {
    if (!p) return '—';
    const u = db.users[p.userId];
    return `Dr. ${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim();
  };
  const slots = useMemo(
    () => (providerId ? slotTimesFor(db.appointments, providerId, dayOffset) : []),
    [db.appointments, providerId, dayOffset]
  );

  /* Deep-link: honor specialty+provider+mode so public CTAs skip straight in. */
  useEffect(() => {
    if (params.get('specialty')) setStep((s) => (s === 0 ? 1 : s));
    if (params.get('specialty') && params.get('provider')) setStep((s) => (s === 0 || s === 1 ? 2 : s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canConfirm =
    Boolean(providerId) &&
    dayOffset !== null &&
    slotTime !== null &&
    reason.trim().length > 0 &&
    (!guestMode || (guest.name.trim() && guest.phone.trim() && guest.dob.trim()));

  function next() {
    setError('');
    if (step === 0 && !specialty) {
      setError('Please choose a specialty to continue.');
      return;
    }
    if (step === 1 && (!providerId || slotTime === null)) {
      setError('Please choose a doctor, a day and an open time slot.');
      return;
    }
    setStep((s) => Math.min(s + 1, 2));
  }

  function book() {
    if (!canConfirm) {
      setError(guestMode ? 'Please complete all fields — including the reason for your visit.' : 'Please add a reason for your visit — it helps your clinician prepare.');
      return;
    }
    const patientId = guestMode ? 'guest' : user?.id;
    dbActions.bookAppointment({
      actor: guestMode ? 'guest' : user?.id,
      patientId,
      providerId,
      dayOffset,
      slotTime,
      type,
      reason: reason.trim(),
    });
    const appt = {
      provider: provider,
      date: slotTimeToDate(dayOffset, slotTime),
      type,
      reason: reason.trim(),
    };
    setBooked(appt);
  }

  /* ---------- confirmation screen ---------- */
  if (booked) {
    return (
      <div className="mx-auto w-full max-w-lg py-8">
        <div className="rounded-2xl border border-line bg-surface-raised p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success-ink">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-ink">You're booked!</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            {guestMode ? 'We saved your spot as a guest.' : `A confirmation was added to your account, ${user?.firstName}.`}
          </p>
          <div className="mx-auto mt-6 max-w-sm space-y-3 rounded-xl bg-neutral-50 p-5 text-left text-sm">
            <p className="flex items-center justify-between gap-3">
              <span className="text-ink-muted">Visit</span>
              <span className="font-semibold text-ink">{booked.type === 'video' ? 'Video visit' : 'In-person visit'}</span>
            </p>
            <p className="flex items-center justify-between gap-3">
              <span className="text-ink-muted">Clinician</span>
              <span className="font-semibold text-ink">{providerFullName(booked.provider)}</span>
            </p>
            <p className="flex items-center justify-between gap-3">
              <span className="text-ink-muted">When</span>
              <span className="font-semibold text-ink">{formatDayName(booked.date)}, {formatDate(booked.date)} at {formatTime(booked.date)}</span>
            </p>
            {feeRange(feeSpec) && (
              <p className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">Est. fee</span>
                <span className="font-semibold text-ink">{feeRange(feeSpec)}</span>
              </p>
            )}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {guestMode ? (
              <>
                <p className="text-sm text-ink-secondary">
                  To see this visit in Appointments, get reminders and message your care team,
                  sign in or create an account.
                </p>
                <Button to="/auth/login" block>Sign in to track your visit</Button>
                <Button to="/find-a-doctor" variant="outline" block>Back to find a doctor</Button>
              </>
            ) : (
              <>
                <Button to="/portal/patient" block>Go to your dashboard</Button>
                <Button to="/portal/patient/appointments" variant="outline" block>View all appointments</Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- form wizard ---------- */
  return (
    <div>
      {guestMode && (
        <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900 text-white"><LogoMark size="sm" /></span>
            <div>
              <p className="text-sm font-bold text-ink">Book an appointment</p>
              <p className="text-xs text-ink-muted">No sign-in needed · encrypted</p>
            </div>
          </div>
          <Button to="/find-a-doctor" variant="ghost" size="sm"><ChevronLeft className="h-3.5 w-3.5" /> Back</Button>
        </div>
      )}

      <Stepper steps={STEPS} current={step} onStep={setStep} />

      {error && (
        <div className="mt-4">
          <Alert tone="warning" title="Check a few things">{error}</Alert>
        </div>
      )}

      {/* STEP 0 — specialty */}
      {step === 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-ink">What brings you in?</h2>
          <p className="text-sm text-ink-secondary">Pick a specialty and we'll show clinicians with open slots.</p>
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-line bg-accent-soft p-4 text-xs text-ink-secondary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              Most NHIA / HMO plans (Hygeia, AXA Mansard, Leadway, Reliance) cover consultation visits. We
              verify your plan after booking — the self-pay estimate below shows the typical price range.
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSpecialty(s.id); setProviderId(''); setSlotTime(null); }}
                className={[
                  'rounded-xl border p-4 text-left transition-all',
                  specialty === s.id ? 'border-accent bg-accent-soft ring-4 ring-accent/15' : 'border-line bg-surface-raised hover:border-accent',
                ].join(' ')}
              >
                <p className="font-semibold text-ink">{s.name}</p>
                <p className="mt-1 text-xs text-ink-muted">{s.short}</p>
                <p className="mt-2 text-xs font-semibold text-accent">{s.feeMin ? `From ${formatCurrency(s.feeMin)}` : ''}</p>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={next} disabled={!specialty}>Continue</Button>
          </div>
        </div>
      )}

      {/* STEP 1 — provider, day, time */}
      {step === 1 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-ink">Choose your clinician and time</h2>
          <p className="text-sm text-ink-secondary">You picked <strong>{specialties.find((s) => s.id === specialty)?.name}</strong>.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-[1.1fr_1fr]">
            <div className="space-y-3">
              {providers.length === 0 && (
                <div className="rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-ink-muted">No clinicians currently have online scheduling.</div>
              )}
              {providers.map((p) => (
                <div
                  key={p.id}
                  role="radio"
                  aria-checked={providerId === p.id}
                  tabIndex={0}
                  onClick={() => { setProviderId(p.id); setSlotTime(null); setDayOffset(0); }}
                  onKeyDown={(e) => e.key === 'Enter' && setProviderId(p.id)}
                  className={[
                    'cursor-pointer rounded-xl border bg-surface-raised p-4 transition-all',
                    providerId === p.id ? 'border-accent ring-4 ring-accent/15' : 'border-line hover:border-accent',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{p.name} <span className="font-normal text-ink-muted">{p.title}</span></p>
                      <p className="text-xs text-ink-secondary">{p.location}</p>
                    </div>
                    <Rating value={p.rating} count={p.reviews} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-ink-muted">
                    {p.languages.map((l) => (
                      <Pill key={l} tone="neutral" className="!py-0.5 !text-[10px]">{l}</Pill>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink"><CalendarDays className="mr-1 inline h-4 w-4 text-accent" /> Pick a day</p>
              <div className="grid grid-cols-5 gap-2">
                {DAYS.map((d) => {
                  const dt = new Date();
                  dt.setDate(dt.getDate() + d);
                  const on = d === dayOffset;
                  return (
                    <button
                      key={d}
                      disabled={!providerId}
                      onClick={() => { setDayOffset(d); setSlotTime(null); }}
                      className={[
                        'rounded-lg border px-1 py-2 text-center transition-all disabled:cursor-not-allowed disabled:opacity-40',
                        on ? 'border-accent bg-accent text-white' : 'border-line bg-surface-raised text-ink hover:border-accent',
                      ].join(' ')}
                    >
                      <span className="block text-[11px] font-semibold uppercase">{formatDayName(dt).slice(0, 3)}</span>
                      <span className="block text-lg font-bold">{dt.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mb-2 mt-4 text-sm font-medium text-ink"><Clock className="mr-1 inline h-4 w-4 text-accent" /> Open times</p>
              {providerId ? (
                slots.length ? (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((t) => {
                      const on = t === slotTime;
                      return (
                        <button
                          key={t}
                          onClick={() => setSlotTime(t)}
                          aria-pressed={on}
                          className={[
                            'rounded-lg border py-2 text-center text-sm font-medium transition-all',
                            on ? 'border-teal bg-teal text-white' : 'border-line bg-surface-raised text-ink hover:border-teal',
                          ].join(' ')}
                        >
                          {slotTimeToString(t)}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-line-strong p-4 text-center text-sm text-ink-muted">No open slots that day — try another day.</p>
                )
              ) : (
                <p className="rounded-lg border border-dashed border-line-strong p-4 text-center text-sm text-ink-muted">Select a clinician first.</p>
              )}

              {slotTime !== null && providerId && (
                <div className="mt-4 rounded-xl bg-success-soft p-4 text-sm text-success-ink">
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                  {providerFullName(provider)}, {formatDayName(slotTimeToDate(dayOffset, slotTime))} {formatDate(slotTimeToDate(dayOffset, slotTime))} at {formatTime(slotTimeToDate(dayOffset, slotTime))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={next} disabled={!providerId || slotTime === null}>Continue</Button>
          </div>
        </div>
      )}

      {/* STEP 2 — confirm */}
      {step === 2 && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-lg font-semibold text-ink">Confirm your visit</h2>

            {guestMode && (
              <div className="mt-4 rounded-xl border border-line bg-surface-raised p-5">
                <p className="mb-3 text-sm font-semibold text-ink">About you</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Full name" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} placeholder="e.g. Sam Rivera" />
                  <Input label="Phone" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} placeholder="+234 800 000 0000" />
                  <Input label="Date of birth" type="date" value={guest.dob} onChange={(e) => setGuest({ ...guest, dob: e.target.value })} />
                  <Input label="Email (optional)" type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} placeholder="you@email.com" />
                </div>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-line bg-surface-raised p-5">
              <p className="mb-3 text-sm font-semibold text-ink">Visit details</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setType('in-person')} aria-pressed={type === 'in-person'}
                    className={[
                      'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                      type === 'in-person' ? 'border-accent bg-accent-soft text-accent ring-4 ring-accent/15' : 'border-line text-ink-secondary hover:border-accent',
                    ].join(' ')}>
                    <Building className="h-4 w-4" /> In-person
                  </button>
                  <button onClick={() => setType('video')} aria-pressed={type === 'video'}
                    className={[
                      'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                      type === 'video' ? 'border-accent bg-accent-soft text-accent ring-4 ring-accent/15' : 'border-line text-ink-secondary hover:border-accent',
                    ].join(' ')}>
                    <Video className="h-4 w-4" /> Video
                  </button>
                </div>
                <div className="text-sm text-ink-secondary">
                  {type === 'video'
                    ? 'A secure video link is emailed ~10 minutes before your visit.'
                    : `In-person at ${provider.location}.`}
                </div>
              </div>
              <div className="mt-4">
                <Textarea
                  label="Reason for your visit"
                  hint={guestMode ? '' : 'A few sentences helps your clinician prepare in advance.'}
                  rows={4}
                  maxLength={600}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="What symptoms or questions bring you in today?"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-line bg-surface-raised p-5">
              <p className="text-sm font-semibold text-ink">Booking summary</p>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-ink-muted">Specialty</dt><dd className="font-medium text-ink text-right">{specialties.find((s) => s.id === specialty)?.name}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-ink-muted">Clinician</dt><dd className="font-medium text-ink text-right">{providerFullName(provider)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-ink-muted">Location</dt><dd className="font-medium text-ink text-right">{type === 'video' ? 'Video visit' : provider.location}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-ink-muted">Date</dt><dd className="font-medium text-ink text-right">{formatDayName(slotTimeToDate(dayOffset, slotTime))}, {formatDate(slotTimeToDate(dayOffset, slotTime))}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-ink-muted">Time</dt><dd className="font-medium text-ink text-right">{formatTime(slotTimeToDate(dayOffset, slotTime))} · 30 min</dd></div>
                <div className="flex justify-between gap-3 border-t border-line pt-2.5"><dt className="text-ink-muted">Visit type</dt><dd className="font-medium text-ink">{type === 'video' ? 'Video' : 'In-person'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-ink-muted">Estimated fee</dt><dd className="font-medium text-ink text-right">{feeRange(feeSpec) || '—'}</dd></div>
              </dl>
              <div className="mt-4 space-y-2 rounded-lg bg-neutral-50 p-3 text-xs text-ink-muted">
                <p>{guestMode
                  ? 'You\'re booking without an account. Your visit will be saved to this device only.'
                  : 'By booking you agree to our Notice of Privacy Practices and Telehealth consent.'}</p>
                {feeSpec?.feeMin && (
                  <p>Estimate shown is self-pay. If you have NHIA / HMO coverage we'll confirm your copay (if any) at check-in.</p>
                )}
              </div>
              <Button block size="lg" className="mt-4" onClick={book}>Confirm booking</Button>
              <Button block variant="ghost" className="mt-2" onClick={() => setStep(1)}>Back</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}