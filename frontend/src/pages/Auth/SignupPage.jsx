import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, User as UserIcon, ShieldCheck, CalendarCheck, MessagesSquare, MailCheck } from 'lucide-react';
import Input from '../../components/ui/Input.jsx';
import PasswordInput from '../../components/ui/PasswordInput.jsx';
import Button from '../../components/ui/Button.jsx';
import { LogoMark } from '../../components/layout/PublicHeader.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { usePageMeta } from '../../lib/seo.js';
import { apiRequest } from '../../lib/api.js';
import { LazyBg } from '../../components/ui/Page.jsx';

const PERKS = [
  { icon: CalendarCheck, text: 'Same-week appointment booking' },
  { icon: MessagesSquare, text: 'Message your care team anytime' },
  { icon: ShieldCheck, text: 'Secure, NDPA-compliant portal' },
];

function SignupPage() {
  const { push } = useToast();
  const { signup } = useAuth();
  usePageMeta({ title: 'Create an account', description: 'Create a Carebridge Health account to book appointments, message your care team and manage your health records.' });
  const [form, setForm] = useState({ first: '', last: '', email: '', password: '', confirmPassword: '', dob: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.first || !form.last || !form.email || !form.password || !form.confirmPassword || !form.dob) {
      setError('Please complete all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      // The confirmation value is checked locally and never sent to the server.
      await signup({
        email: form.email,
        password: form.password,
        firstName: form.first,
        lastName: form.last,
        dateOfBirth: form.dob,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    setResending(true);
    try {
      await apiRequest('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: form.email }),
      });
      push('Verification email sent', `We sent a new link to ${form.email}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <main id="auth-main" className="min-h-screen min-h-dvh! bg-accent-soft">
      <div className="grid min-h-screen min-h-dvh! lg:grid-cols-2">
        {/* Left photo panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden text-white lg:flex">
          <LazyBg
            image="/images/health/doctor-tablet.jpg"
            className="absolute inset-0 bg-cover bg-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary-900 via-primary-900/70 to-primary-900/35" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(0,0,0,0)_0%,rgba(5,19,39,0.55)_100%)]" />
          <div className="relative flex items-start justify-between p-12">
            <LogoMark />
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/85">
              New patients welcome
            </span>
          </div>
          <div className="relative max-w-md p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Begin your care journey</p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-white">
              Your health starts with the first step.
            </h2>
            <ul className="mt-6 space-y-2.5 text-sm text-white/85">
              {PERKS.map((p) => (
                <li key={p.text} className="flex items-center gap-2.5">
                  <p.icon className="h-4 w-4 shrink-0 text-gold" />
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative border-t border-white/15 p-12 pt-6">
            <p className="text-xs text-white/55">Your account is created by the Carebridge server.</p>
          </div>
        </section>

        {/* Right panel */}
        <section className="flex flex-col justify-start px-6 py-12 md:px-16 lg:justify-center">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 flex justify-center lg:hidden">
              <LogoMark />
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-line bg-surface-raised p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <MailCheck className="h-5 w-5" />
                </span>
                <h1 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink">Check your inbox</h1>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  We created your account and sent a verification link to{' '}
                  <span className="font-semibold text-ink">{form.email}</span>. Open it to
                  activate your account — the link expires in 24 hours.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  Didn’t get the email? Check your spam folder, or resend it below.
                </p>
                {error && <p className="mt-3 text-xs text-danger-ink" role="alert">{error}</p>}
                <Button
                  type="button"
                  block
                  size="lg"
                  className="mt-5"
                  loading={resending}
                  onClick={resend}
                >
                  Resend verification email
                </Button>
                <p className="mt-6 text-center text-sm text-ink-muted">
                  Already verified?{' '}
                  <Link to="/auth/login" className="font-semibold text-accent hover:text-accent-deep">Sign in</Link>
                </p>
              </div>
            ) : (
              <>
                <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">Create your account</h1>
                <p className="mt-2 text-sm text-ink-secondary">Sign up to book visits, message your care team and manage your health.</p>
                <form onSubmit={submit} className="mt-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First name" icon={UserIcon} value={form.first} onChange={(e) => setForm({ ...form, first: e.target.value })} required />
                    <Input label="Last name" value={form.last} onChange={(e) => setForm({ ...form, last: e.target.value })} required />
                  </div>
                  <Input label="Email" type="email" icon={Mail} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <PasswordInput
                    label="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    hint="Use at least 8 characters (maximum 72 characters)."
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    required
                  />
                  <PasswordInput
                    label="Confirm password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    required
                  />
                  <Input label="Date of birth" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required />
                  {error && <p className="text-xs text-danger-ink" role="alert">{error}</p>}
                  <Button type="submit" block size="lg" loading={busy}>Create account</Button>
                </form>
                <p className="mt-6 text-center text-sm text-ink-muted">
                  Already have an account?{' '}
                  <Link to="/auth/login" className="font-semibold text-accent hover:text-accent-deep">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default SignupPage;
