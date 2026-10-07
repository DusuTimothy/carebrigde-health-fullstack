import { Router } from 'express';
import {
  register,
  login,
  me,
  demo,
  forgotPassword,
  resetPassword,
  stepUpRequest,
  stepUpVerify,
} from '../controllers/authController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  registerSchema,
  loginSchema,
  demoSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  stepUpRequestSchema,
  stepUpVerifySchema,
} from '../validators/authValidator.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/demo', validate(demoSchema), demo);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/mfa/request', authenticate, validate(stepUpRequestSchema), stepUpRequest);
router.post('/mfa/verify', authenticate, validate(stepUpVerifySchema), stepUpVerify);
router.get('/me', authenticate, me);

export default router;