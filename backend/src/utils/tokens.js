import crypto from 'node:crypto';

/* Single-use, high-entropy tokens for email verification and password reset.
   Only the SHA-256 hash is persisted; the raw value is emailed once and never
   stored or returned by the API. SHA-256 is appropriate here because the token
   itself is 256 bits of CSPRNG output (no brute-force / bcrypt cost needed). */

export const generateRawToken = () => crypto.randomBytes(32).toString('base64url');

export const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(String(rawToken)).digest('hex');

export const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

export const expiryInMinutes = {
  emailVerification: 24 * 60,
  passwordReset: 60,
};

export default { generateRawToken, hashToken, minutesFromNow, expiryInMinutes };
