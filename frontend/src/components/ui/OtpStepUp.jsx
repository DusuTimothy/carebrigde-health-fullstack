import React, { useEffect, useRef, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import Button from './Button.jsx';

/* ==========================================================================
   OTP step-up modal content.
   - Email is used ONLY as a delivery channel for one-time codes.
   - The component is generic: it shows where the code was sent and lets the
     user paste the 6-digit code. Verification is simulated (any 6 digits work
     in this demo, but the UI mirrors the production flow).
   - Callers pass `purpose` (what the OTP is unlocking) and `onVerified`.
   ========================================================================== */

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpStepUp({ purpose, email, onVerified, onCancel }) {
  const inputs = useRef([]);
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState('');

  /* Tick the resend cooldown */
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [secondsLeft]);

  function handleDigit(i, value) {
    if (!/^\d$/.test(value) && value !== '') return;
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (value && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
    if (next.every((d) => d !== '')) verify(next.join(''));
  }

  function verify(code) {
    if (code.length !== CODE_LENGTH) {
      setError(`Enter all ${CODE_LENGTH} digits.`);
      return;
    }
    /* Demo verification — any 6-digit code passes. */
    setError('');
    onVerified?.(code);
  }

  function resend() {
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(CODE_LENGTH).fill(''));
    inputs.current[0]?.focus();
  }

  function submit(e) {
    e.preventDefault();
    verify(digits.join(''));
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-line bg-accent-soft/40 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Mail className="h-4 w-4" />
        </span>
        <div className="text-sm">
          <p className="font-semibold text-ink">One-time code sent</p>
          <p className="text-ink-secondary">
            We sent a {CODE_LENGTH}-digit code to <strong>{email ?? 'your email'}</strong> to verify this action.
          </p>
        </div>
      </div>

      {purpose && (
        <p className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-ink-secondary">
          Authorising: <span className="font-semibold text-ink">{purpose}</span>
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Verification code</label>
        <div className="grid grid-cols-6 gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`Digit ${i + 1}`}
              className="h-12 w-full rounded-lg border border-line bg-surface-raised text-center text-lg font-bold text-ink focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25"
            />
          ))}
        </div>
        {error && <p className="mt-2 text-xs text-danger-ink">{error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <button
          type="button"
          onClick={resend}
          disabled={secondsLeft > 0}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-deep disabled:cursor-not-allowed disabled:text-ink-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
        </button>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-line bg-surface-raised px-4 py-2.5 text-sm font-semibold text-ink-secondary hover:border-accent hover:text-accent"
            >
              Cancel
            </button>
          )}
          <Button type="submit">Verify and continue</Button>
        </div>
      </div>
    </form>
  );
}