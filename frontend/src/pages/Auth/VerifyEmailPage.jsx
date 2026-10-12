import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck, MailWarning, Mail } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { LogoMark } from '../../components/layout/PublicHeader.jsx';
import { usePageMeta } from '../../lib/seo.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { apiRequest } from '../../lib/api.js';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { push } = useToast();
  const [status, setStatus] = useState(token ? 'verifying' : 'missing');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const requested = useRef(false);
  usePageMeta({ title: 'Verify your email', description: 'Confirm your Carebridge Health email address to activate your account.' });

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;
    apiRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then((result) => {
        setStatus('success');
        setMessage(result.message || 'Your email address is verified.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [token]);

  async function resend(e) {
    e.preventDefault();
    setResending(true);
    try {
      await apiRequest('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      push('Verification email sent', `If an account exists for ${email}, a new link is on its way.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <main id="auth-main" className="min-h-screen bg-accent-soft px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex justify-center"><LogoMark /></div>
        <div className="rounded-2xl border border-line bg-surface-raised p-8">
          {status === 'verifying' && (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Mail className="h-5 w-5" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-ink">Verifying your email…</h1>
              <p className="mt-2 text-sm text-ink-secondary">This only takes a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-success-soft text-success-ink">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-ink">Email verified</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {message || 'Your email address is verified.'} You can now sign in.
              </p>
              <Button block className="mt-6" to="/auth/login">Continue to sign in</Button>
            </>
          )}

          {(status === 'error' || status === 'missing') && (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-warning-soft text-warning-ink">
                <MailWarning className="h-5 w-5" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-ink">
                {status === 'missing' ? 'Verification link needed' : 'We couldn’t verify that link'}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {status === 'missing'
                  ? 'Open the verification link from your email to activate your account.'
                  : message}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Links are time-limited. If yours has expired, enter your email to request a new one.
              </p>
              <form onSubmit={resend} className="mt-4 space-y-4">
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Button type="submit" block size="lg" loading={resending}>Resend verification email</Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-ink-muted">
            <Link to="/auth/login" className="font-semibold text-accent hover:text-accent-deep">Back to sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default VerifyEmailPage;
