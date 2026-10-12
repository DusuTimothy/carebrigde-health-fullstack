import { Resend } from 'resend';

/* ==========================================================================
   Transactional email via Resend (backend only — the API key never reaches the
   browser). Configuration comes from the backend environment:
     RESEND_API_KEY  – server-only Resend API key
     EMAIL_FROM      – verified sender, e.g. "Carebridge Health <no-reply@x.com>"
     CLIENT_URL      – public frontend origin used to build link URLs

   In non-production environments without RESEND_API_KEY, messages are kept in
   an in-memory outbox instead of being sent. This is a development/testing
   convenience only: it lets tests and local work inspect the emailed link, and
   it never logs tokens. Production fails loudly when email is not configured.
   ========================================================================== */

export class EmailDeliveryError extends Error {
  constructor(message = 'We could not send the email right now. Please try again.', cause) {
    super(message);
    this.name = 'EmailDeliveryError';
    this.statusCode = 502;
    // Safe, client-facing message — do not let the generic 5xx masker hide it.
    this.expose = true;
    if (cause) this.cause = cause;
  }
}

const isProduction = () => process.env.NODE_ENV === 'production';
const isTest = () => process.env.NODE_ENV === 'test';

const OUTBOX_LIMIT = 50;
const outbox = [];

/* Development/test-only: read the most recent captured messages. */
export const getEmailOutbox = () => outbox.slice();
export const clearEmailOutbox = () => {
  outbox.length = 0;
};

let client = null;
const getClient = () => {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
};

const clientUrl = () => {
  const configured =
    process.env.CLIENT_URL ||
    (process.env.CORS_ORIGIN || '').split(',')[0] ||
    'http://localhost:5173';
  return configured.trim().replace(/\/$/, '');
};

const record = (message) => {
  outbox.push(message);
  if (outbox.length > OUTBOX_LIMIT) outbox.shift();
};

export async function sendEmail({ to, subject, text, html, template }) {
  if (!to) throw new EmailDeliveryError('A recipient email address is required.');

  const message = { to, subject, text, html, template, createdAt: new Date().toISOString() };

  if (!process.env.RESEND_API_KEY) {
    if (isProduction()) {
      throw new EmailDeliveryError(
        'Email delivery is not configured on the server. Set RESEND_API_KEY and EMAIL_FROM.'
      );
    }
    record(message);
    if (!isTest()) {
      // Never log the token/link itself.
      console.warn(
        `[email] RESEND_API_KEY not set — captured "${template}" email for ${to} in the development outbox (not sent).`
      );
    }
    return { id: `dev-outbox-${outbox.length}`, dev: true };
  }

  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new EmailDeliveryError('EMAIL_FROM is not configured on the server.');
  }

  let result;
  try {
    result = await getClient().emails.send({ from, to, subject, html, text });
  } catch (cause) {
    throw new EmailDeliveryError(undefined, cause);
  }

  if (result?.error) {
    throw new EmailDeliveryError(undefined, result.error);
  }

  return result?.data ?? { id: null };
}

const layout = (heading, body, ctaLabel, ctaUrl) => `
  <div style="margin:0 auto;max-width:520px;font-family:Arial,Helvetica,sans-serif;color:#111827">
    <h1 style="font-size:20px;margin:0 0 12px">${heading}</h1>
    <p style="font-size:14px;line-height:1.6;color:#374151;margin:0 0 20px">${body}</p>
    <p style="margin:0 0 24px">
      <a href="${ctaUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">${ctaLabel}</a>
    </p>
    <p style="font-size:12px;line-height:1.6;color:#6b7280;margin:0 0 4px">If the button does not work, copy and paste this link into your browser:</p>
    <p style="font-size:12px;line-height:1.6;color:#0f766e;word-break:break-all;margin:0 0 24px">${ctaUrl}</p>
    <p style="font-size:12px;color:#9ca3af;margin:0">Carebridge Health — please do not reply to this message.</p>
  </div>
`;

export async function sendVerificationEmail({ to, name, token }) {
  const link = `${clientUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`;
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const subject = 'Verify your Carebridge Health email address';
  const text = [
    greeting,
    '',
    'Thanks for creating a Carebridge Health account.',
    'Confirm your email address to activate your account (this link expires in 24 hours):',
    link,
    '',
    'If you did not create this account you can ignore this email.',
  ].join('\n');

  return sendEmail({
    to,
    subject,
    text,
    html: layout(
      'Verify your email address',
      `${greeting} Thanks for creating a Carebridge Health account. This link is valid for 24 hours.`,
      'Verify email address',
      link
    ),
    template: 'email-verification',
  });
}

export async function sendPasswordResetEmail({ to, name, token }) {
  const link = `${clientUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const subject = 'Reset your Carebridge Health password';
  const text = [
    greeting,
    '',
    'We received a request to reset your Carebridge Health password.',
    'Choose a new password using this link (valid for 1 hour):',
    link,
    '',
    'If you did not request this, you can safely ignore this email — your password will not change.',
  ].join('\n');

  return sendEmail({
    to,
    subject,
    text,
    html: layout(
      'Reset your password',
      `${greeting} We received a request to reset your password. This link is valid for 1 hour. If you did not request it, you can ignore this email.`,
      'Choose a new password',
      link
    ),
    template: 'password-reset',
  });
}

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail, getEmailOutbox, clearEmailOutbox };
