import React from 'react';
import { KeyRound } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { LogoMark } from '../../components/layout/PublicHeader.jsx';
import { usePageMeta } from '../../lib/seo.js';

function ResetPasswordPage() {
  usePageMeta({ title: 'Password recovery', description: 'Contact your Carebridge administrator for password recovery assistance.' });

  return (
    <main id="auth-main" className="min-h-screen bg-accent-soft px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex justify-center"><LogoMark /></div>
        <div className="rounded-2xl border border-line bg-surface-raised p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <KeyRound className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-ink">Reset your password</h1>
          <div className="mt-4">
            <p className="text-sm leading-relaxed text-ink-secondary">
              Password recovery is not configured yet, so a reset link cannot be sent. Contact your Carebridge administrator to reset your account securely.
            </p>
            <Button variant="outline" block className="mt-6" to="/auth/login">Back to sign in</Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ResetPasswordPage;