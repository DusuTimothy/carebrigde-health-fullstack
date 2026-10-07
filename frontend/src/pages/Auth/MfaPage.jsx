import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { LogoMark } from '../../components/layout/PublicHeader.jsx';
import { usePageMeta } from '../../lib/seo.js';

function MfaPage() {
  usePageMeta({ title: 'Two-step verification', description: 'Information about two-step verification for Carebridge Health sign-in.' });

  return (
    <main id="auth-main" className="min-h-screen bg-accent-soft px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex justify-center"><LogoMark /></div>
        <section className="rounded-2xl border border-line bg-surface-raised p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-ink">Two-step verification</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Two-step verification is not configured for sign-in yet. Use your email and password to access your account.
          </p>
          <Link to="/auth/login" className="mt-6 inline-flex w-full justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-deep">
            Back to sign in
          </Link>
        </section>
      </div>
    </main>
  );
}

export default MfaPage;