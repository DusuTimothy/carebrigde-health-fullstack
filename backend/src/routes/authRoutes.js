import { Router } from 'express';
import {
  register,
  login,
  me,
  demo,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  stepUpRequest,
  stepUpVerify,
} from '../controllers/authController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { emailRequestLimiter } from '../middleware/rateLimiters.js';
import {
  registerSchema,
  loginSchema,
  demoSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  stepUpRequestSchema,
  stepUpVerifySchema,
} from '../validators/authValidator.js';

const router = Router();

router.post('/register', emailRequestLimiter, validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/demo', validate(demoSchema), demo);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post(
  '/resend-verification',
  emailRequestLimiter,
  validate(resendVerificationSchema),
  resendVerification
);
router.post('/forgot-password', emailRequestLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/mfa/request', authenticate, validate(stepUpRequestSchema), stepUpRequest);
router.post('/mfa/verify', authenticate, validate(stepUpVerifySchema), stepUpVerify);
router.get('/me', authenticate, me);

export default router;
