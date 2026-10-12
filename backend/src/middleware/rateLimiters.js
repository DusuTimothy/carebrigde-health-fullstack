import rateLimit from 'express-rate-limit';

/* Rate limits for endpoints that trigger transactional email (registration,
   verification resend and password reset) so they cannot be used to spam an
   inbox or brute-force token generation. Tests bypass the limiter to avoid
   cross-test interference; production gets the tightest budget. */
const production = process.env.NODE_ENV === 'production';

export const emailRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: production ? 5 : 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many requests. Please wait a few minutes and try again.',
  },
});

export default emailRequestLimiter;
