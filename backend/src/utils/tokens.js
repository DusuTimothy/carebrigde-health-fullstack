import crypto from 'node:crypto';

/* Single-use, high-entropy tokens for email verification and password reset.
   Only the SHA-256 hash is persisted; the raw value is emailed once and never
   stored or returned by the API. SHA-256 is appropriate here because the token
   itself is 256 bits of CSPRNG output (no brute-force / bcrypt cost needed). */

export const generateRawToken = () => crypto.randomBytes(32).toString('base64url');

export const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(String(rawToken)).digest('hex');

export const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

const positiveIntFromEnv = (name, fallback) => {
  const parsed = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/* Read lazily so the environment is fully loaded before the value is used
   (server.js imports the app before calling dotenv.config()). */
export const expiryInMinutes = {
  get emailVerification() {
    return positiveIntFromEnv('EMAIL_VERIFICATION_TTL_MINUTES', 60);
  },
  get passwordReset() {
    return positiveIntFromEnv('PASSWORD_RESET_TTL_MINUTES', 60);
  },
};

/* Human-readable duration for email copy, e.g. 60 -> "1 hour", 90 -> "90 minutes". */
export const describeMinutes = (minutes) => {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
};

export default { generateRawToken, hashToken, minutesFromNow, expiryInMinutes, describeMinutes };
