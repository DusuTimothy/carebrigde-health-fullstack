import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { LogoMark } from '../../components/layout/PublicHeader.jsx';
import { usePageMeta } from '../../lib/seo.js';
import { apiRequest } from '../../lib/api.js';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  usePageMeta({ title: 'Password recovery', description: 'Request a password reset or choose a new password for your Carebridge Health account.' });

  async function requestReset(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const result = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (result.data?.resetToken) {
        setToken(result.data.resetToken);
        setNotice('A development reset token was returned. Choose a new password below.');
      } else {
        setRequestSent(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const result = await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setNotice(result.message || 'Password reset successfully. You can now sign in.');
      setResetComplete(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="auth-main" className="min-h-screen bg-accent-soft px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex justify-center"><LogoMark /></div>
        <div className="rounded-2xl border border-line bg-surface-raised p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <KeyRound className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-ink">
            {resetComplete ? 'Password updated' : 'Reset your password'}
          </h1>

          {resetComplete ? (
            <>
              <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{notice}</p>
              <Button block className="mt-6" to="/auth/login">Back to sign in</Button>
            </>
          ) : token || requestSent ? (
            <>
              {requestSent && (
                <div className="mt-4">
                  <p className="text-sm leading-relaxed text-ink-secondary">
                    If an account exists for that email, you’ll receive instructions to reset your password.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    If you don’t receive an email, contact your administrator. Email delivery must be configured on the server.
                  </p>
                </div>
              )}
              {notice && <p className="mt-4 text-sm text-ink-secondary" role="status">{notice}</p>}
              <form onSubmit={resetPassword} className="mt-5 space-y-4">
                <Input
                  label="Reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  autoComplete="one-time-code"
                />
                <div className="relative">
                  <Input
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    icon={Lock}
                    hint="Use at least 8 characters."
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    className="pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={`${showPassword ? 'Hide' : 'Show'} new password`}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-7 flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-accent-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {showPassword ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="Confirm new password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    icon={Lock}
                    autoComplete="new-password"
                    className="pr-12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={`${showConfirmPassword ? 'Hide' : 'Show'} password confirmation`}
                    aria-pressed={showConfirmPassword}
                    className="absolute right-2 top-7 flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-accent-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {showConfirmPassword ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
                  </button>
                </div>
                {error && <p className="text-xs text-danger-ink" role="alert">{error}</p>}
                <Button type="submit" block size="lg" loading={busy}>Update password</Button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setToken('');
                  setRequestSent(false);
                  setNotice('');
                  setError('');
                }}
                className="mt-4 w-full text-center text-sm font-semibold text-accent hover:text-accent-deep"
              >
                Request another reset
              </button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Enter the email address associated with your account and we’ll help you reset your password.
              </p>
              <form onSubmit={requestReset} className="mt-5 space-y-4">
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                {error && <p className="text-xs text-danger-ink" role="alert">{error}</p>}
                <Button type="submit" block size="lg" loading={busy}>Send reset instructions</Button>
              </form>
            </>
          )}

          {!resetComplete && (
            <p className="mt-6 text-center text-sm text-ink-muted">
              Remember your password?{' '}
              <Link to="/auth/login" className="font-semibold text-accent hover:text-accent-deep">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
