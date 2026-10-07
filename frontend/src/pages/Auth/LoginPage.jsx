import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, AlertTriangle, UserCheck, Stethoscope, ShieldCheck, UserCog, HeartPulse, Pill, FlaskConical, ConciergeBell } from 'lucide-react';
import { useAuth, DEMO_ROLES } from '../../lib/auth.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LogoMark } from '../../components/layout/PublicHeader.jsx';
import { roleOf } from '../../lib/rbac.js';
import { usePageMeta } from '../../lib/seo.js';
import { LazyBg } from '../../components/ui/Page.jsx';

/* Demo accounts are keyed by role; the backend picks the matching seeded user
   for that role so the dashboard always has real data behind it. */
const ROLE_ICON = {
  patient: UserCheck,
  provider: Stethoscope,
  admin: UserCog,
  nurse: HeartPulse,
  pharmacist: Pill,
  lab_tech: FlaskConical,
  front_desk: ConciergeBell,
  default: ShieldCheck,
};

function LoginPage() {
  const { login, demoLogin } = useAuth();
  usePageMeta({ title: 'Sign in', description: 'Sign in to the Carebridge Health patient portal — book appointments, view results and message your care team.' });
  const [params] = useSearchParams();
  const reason = params.get('reason');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await login({ email, password });
      const base = roleOf(res.user)?.portalBase ?? '/portal/patient';
      window.location.assign(base);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function quickLogin(role) {
    setError('');
    setBusy(true);
    try {
      const res = await demoLogin(role);
      const base = roleOf(res.user)?.portalBase ?? '/portal/patient';
      window.location.assign(base);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main id="auth-main" className="min-h-screen bg-accent-soft">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-primary-900 p-12 text-white lg:flex">
          <LazyBg image="/images/health/doctor-portrait2.jpg" className="absolute inset-0 bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/70 to-primary-900/35" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(0,0,0,0)_0%,rgba(5,19,39,0.55)_100%)]" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />
          <LogoMark className="relative text-white" />
          <div className="relative">
            <h2 className="font-display text-4xl font-medium leading-tight tracking-tight">
              Your health, in your hands.
            </h2>
            <p className="mt-3 max-w-md text-white/85">
              Book visits, message your care team, refill prescriptions and read lab results — all in one secure place.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              {['Secure, NDPA-compliant portal', 'Fast same-week appointment booking', '24/7 access to your records'].map((t) => (
                <li key={t} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal" />{t}</li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-white/50">Development demo accounts are not available in production.</p>
        </section>

        {/* Right panel */}
        <section className="flex flex-col justify-center px-6 py-12 md:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <LogoMark />
            </div>
            <h1 className="text-2xl font-bold text-ink">Sign in to your portal</h1>
            <p className="mt-1 text-sm text-ink-secondary">Welcome back. Enter your credentials, or try a demo account below.</p>

            {reason === 'timeout' && (
              <div className="mt-4">
                <Alert tone="warning" title="Session timed out" icon={AlertTriangle}>
                  You were signed out after 15 minutes of inactivity for your security.
                </Alert>
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" icon={Mail} required autoComplete="email" />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" icon={Lock} required autoComplete="current-password" />
              {error && <p className="text-xs text-danger-ink">{error}</p>}
              <div className="flex items-center justify-between text-sm">
                <Link to="/auth/reset-password" className="font-semibold text-accent hover:text-accent-deep">Forgot password?</Link>
              </div>
              <Button type="submit" block size="lg" loading={busy}>Sign in</Button>
            </form>

            {import.meta.env.DEV && (
              <>
                <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
                  <span className="h-px flex-1 bg-line" />
                  OR TRY A DEVELOPMENT DEMO ACCOUNT
                  <span className="h-px flex-1 bg-line" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {DEMO_ROLES.map((d) => {
                    const Icon = ROLE_ICON[d.role] ?? ShieldCheck;
                    return (
                      <button
                        key={d.role}
                        onClick={() => quickLogin(d.role)}
                        disabled={busy}
                        className="group flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-3 text-left transition-all hover:border-accent hover:shadow-sm"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold leading-tight text-ink">{d.label}</span>
                          <span className="block truncate text-xs text-ink-muted">{d.note}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <p className="mt-8 text-center text-sm text-ink-muted">
              New to Carebridge?{' '}
              <Link to="/auth/signup" className="font-semibold text-accent hover:text-accent-deep">Create an account</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;