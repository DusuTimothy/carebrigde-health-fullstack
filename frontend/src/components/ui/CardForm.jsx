import React, { useMemo, useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import Input from './Input.jsx';

/* ==========================================================================
   Card payment form.
   - Card number with Luhn validation + brand detection (Visa, MC, Amex, Verve).
   - Expiry MM/YY with month range + not-in-past check.
   - CVC with brand-aware length (3 digits, 4 for Amex).
   - Cardholder name.
   - Saves cards on the authenticated user's profile (mock tokenisation — no PAN
     is ever persisted; only last4 + brand + exp).
   - On submit, calls the supplied `onTokenise` callback with a token object so
     pages can run their own payment logic (mock charge, audit log, etc.).
   ========================================================================== */

const BRANDS = [
  { name: 'Visa', re: /^4/, lengths: [13, 16, 19], cvc: 3 },
  { name: 'Mastercard', re: /^(5[1-5]|2[2-7])/, lengths: [16], cvc: 3 },
  { name: 'Amex', re: /^3[47]/, lengths: [15], cvc: 4 },
  { name: 'Verve', re: /^(506[01]|5078|6500|6504|6509)/, lengths: [16, 19], cvc: 3 },
];

function detectBrand(num) {
  const cleaned = num.replace(/\D/g, '');
  return BRANDS.find((b) => b.re.test(cleaned)) ?? null;
}

function luhn(num) {
  const cleaned = num.replace(/\D/g, '');
  if (cleaned.length < 12) return false;
  let sum = 0;
  let alt = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = Number(cleaned[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 19);
  const brand = detectBrand(cleaned);
  /* Amex is grouped 4-6-5; everything else 4-4-4-4. */
  if (brand?.name === 'Amex') {
    return [cleaned.slice(0, 4), cleaned.slice(4, 10), cleaned.slice(10, 15)].filter(Boolean).join(' ');
  }
  return cleaned.match(/.{1,4}/g)?.join(' ') ?? '';
}

function validateExpiry(value) {
  const m = value.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m) return { ok: false, reason: 'Use MM/YY' };
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return { ok: false, reason: 'Invalid month' };
  const now = new Date();
  const expEnd = new Date(year, month, 0, 23, 59, 59);
  if (expEnd < now) return { ok: false, reason: 'Card expired' };
  return { ok: true };
}

function formatExpiry(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length < 3) return cleaned;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
}

function onlyDigits(value, max) {
  return value.replace(/\D/g, '').slice(0, max);
}

const initialState = { name: '', number: '', expiry: '', cvc: '', saveCard: true };

export default function CardForm({
  amount,
  currency = 'USD',
  onTokenise,
  onCancel,
  submitLabel = 'Pay now',
  defaultName = '',
  defaultSave = true,
}) {
  const [form, setForm] = useState({ ...initialState, name: defaultName, saveCard: defaultSave });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const brand = useMemo(() => detectBrand(form.number), [form.number]);
  const expectedCvc = brand?.cvc ?? 3;

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    else if (form.name.trim().length < 2) e.name = 'Too short';
    const num = form.number.replace(/\D/g, '');
    if (!num) e.number = 'Required';
    else if (brand && !brand.lengths.includes(num.length)) e.number = `Must be ${brand.lengths.join(' or ')} digits`;
    else if (!luhn(num)) e.number = 'Invalid card number';
    if (!form.expiry) e.expiry = 'Required';
    else {
      const v = validateExpiry(form.expiry);
      if (!v.ok) e.expiry = v.reason;
    }
    if (!form.cvc) e.cvc = 'Required';
    else if (form.cvc.length !== expectedCvc) e.cvc = `${expectedCvc} digits`;
    return e;
  }, [form, brand, expectedCvc]);

  const valid = Object.keys(errors).length === 0;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, number: true, expiry: true, cvc: true });
    if (!valid) {
      setError('Please fix the highlighted fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    /* Mock tokenisation — never persist the PAN. */
    const num = form.number.replace(/\D/g, '');
    const token = {
      brand: brand?.name ?? 'Card',
      last4: num.slice(-4),
      expMonth: Number(form.expiry.replace(/\D/g, '').slice(0, 2)),
      expYear: 2000 + Number(form.expiry.replace(/\D/g, '').slice(2, 4)),
      cardholder: form.name.trim(),
      save: form.saveCard,
    };
    /* Simulate network round-trip. */
    window.setTimeout(() => {
      setSubmitting(false);
      onTokenise?.(token);
    }, 500);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Cardholder name"
        placeholder="As shown on card"
        autoComplete="cc-name"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        error={touched.name ? errors.name : undefined}
      />

      <div>
        <Input
          label="Card number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder={brand?.name === 'Amex' ? '•••• •••••• •••••' : '•••• •••• •••• ••••'}
          icon={CreditCard}
          value={form.number}
          onChange={(e) => set('number', formatCardNumber(e.target.value))}
          onBlur={() => setTouched((t) => ({ ...t, number: true }))}
          error={touched.number ? errors.number : undefined}
        />
        {brand && form.number && (
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            {brand.name} detected
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiry (MM/YY)"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          value={form.expiry}
          onChange={(e) => set('expiry', formatExpiry(e.target.value))}
          onBlur={() => setTouched((t) => ({ ...t, expiry: true }))}
          error={touched.expiry ? errors.expiry : undefined}
        />
        <Input
          label={brand?.name === 'Amex' ? 'CVC (4 digits)' : 'CVC (3 digits)'}
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder={brand?.name === 'Amex' ? '••••' : '•••'}
          maxLength={expectedCvc}
          value={form.cvc}
          onChange={(e) => set('cvc', onlyDigits(e.target.value, expectedCvc))}
          onBlur={() => setTouched((t) => ({ ...t, cvc: true }))}
          error={touched.cvc ? errors.cvc : undefined}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-ink-secondary">
        <input
          type="checkbox"
          checked={form.saveCard}
          onChange={(e) => set('saveCard', e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] accent-accent"
        />
        <span>
          Save this card for future payments
          <span className="block text-xs text-ink-muted">
            We tokenize your card — your full number is never stored.
          </span>
        </span>
      </label>

      {error && <p className="text-xs text-danger-ink">{error}</p>}

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
          <Lock className="h-3.5 w-3.5" />
          Encrypted in transit · PCI-DSS compliant
        </p>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-lg border border-line bg-surface-raised px-4 py-2.5 text-sm font-semibold text-ink-secondary hover:border-accent hover:text-accent disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-strong active:bg-accent-deep disabled:opacity-60"
          >
            {submitting ? 'Processing…' : `${submitLabel}${amount ? ` · ${currency === 'USD' ? '$' : ''}${amount}` : ''}`}
          </button>
        </div>
      </div>
    </form>
  );
}

export { BRANDS, detectBrand, luhn, validateExpiry, formatCardNumber };