import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ShieldCheck, CalendarCheck, MessagesSquare } from 'lucide-react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { LogoMark } from '../../components/layout/PublicHeader.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { usePageMeta } from '../../lib/seo.js';
import { LazyBg } from '../../components/ui/Page.jsx';

const PERKS = [
  { icon: CalendarCheck, text: 'Same-week appointment booking' },
  { icon: MessagesSquare, text: 'Message your care team anytime' },
  { icon: ShieldCheck, text: 'Secure, NDPA-compliant portal' },
];

function SignupPage() {
  const { push } = useToast();
  const navigate = useNavigate();
  const { signup } = useAuth();
  usePageMeta({ title: 'Create an account', description: 'Create a Carebridge Health account to book appointments, message your care team and manage your health records.' });
  const [form, setForm] = useState({ first: '', last: '', email: '', password: '', dob: '' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!form.first || !form.last || !form.email || !form.password || !form.dob) {
      setError('Please complete all fields.');
      return;
    }
    setError('');
    try {
      const res = await signup({
        email: form.email,
        password: form.password,
        firstName: form.first,
        lastName: form.last,
        dateOfBirth: form.dob,
      });
      push('Account created', `Welcome, ${res.user.firstName}.`);
      navigate('/portal/patient');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main id="auth-main" className="min-h-screen bg-accent-soft">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left photo panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden text-white lg:flex">
          <LazyBg
            image="/images/health/doctor-tablet.jpg"
            className="absolute inset-0 bg-cover bg-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/70 to-primary-900/35" />
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
        <section className="flex flex-col justify-center px-6 py-12 md:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 flex justify-center lg:hidden">
              <LogoMark />
            </div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">Create your account</h1>
            <p className="mt-2 text-sm text-ink-secondary">Sign up to book visits, message your care team and manage your health.</p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First name" icon={UserIcon} value={form.first} onChange={(e) => setForm({ ...form, first: e.target.value })} required />
                <Input label="Last name" value={form.last} onChange={(e) => setForm({ ...form, last: e.target.value })} required />
              </div>
              <Input label="Email" type="email" icon={Mail} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Password" type="password" icon={Lock} hint="Use at least 12 characters (maximum 72 UTF-8 bytes)." minLength={12} maxLength={72} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <Input label="Date of birth" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required />
              {error && <p className="text-xs text-danger-ink">{error}</p>}
              <Button type="submit" block size="lg">Create account</Button>
            </form>
            <p className="mt-6 text-center text-sm text-ink-muted">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-semibold text-accent hover:text-accent-deep">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SignupPage;