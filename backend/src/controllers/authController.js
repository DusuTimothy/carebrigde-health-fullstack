import crypto from 'node:crypto';
import { getSequelize } from '../config/database.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { successResponse, createdResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';
import { generateRawToken, hashToken, minutesFromNow, expiryInMinutes } from '../utils/tokens.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';

const publicUser = (user) => {
  const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  delete json.password;
  return json;
};

const isProduction = () => process.env.NODE_ENV === 'production';

const GENERIC_RESET_MESSAGE =
  'If an account exists for that email, we have sent instructions to reset the password.';
const GENERIC_RESEND_MESSAGE =
  'If an account exists for that email, we have sent a verification link. Please check your inbox.';

/* Invalidate any outstanding tokens of a kind for a user, then issue a fresh
   single-use token. Returns the raw token (to be emailed, never stored). */
const issueEmailVerificationToken = async (sequelize, userId) => {
  const { EmailVerificationToken } = sequelize.models;
  const now = new Date();
  await EmailVerificationToken.update(
    { usedAt: now },
    { where: { userId, usedAt: null } }
  );
  const rawToken = generateRawToken();
  await EmailVerificationToken.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: minutesFromNow(expiryInMinutes.emailVerification),
  });
  return rawToken;
};

const issuePasswordResetToken = async (sequelize, userId) => {
  const { PasswordResetToken } = sequelize.models;
  const now = new Date();
  await PasswordResetToken.update(
    { usedAt: now },
    { where: { userId, usedAt: null } }
  );
  const rawToken = generateRawToken();
  await PasswordResetToken.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: minutesFromNow(expiryInMinutes.passwordReset),
  });
  return rawToken;
};

export const demo = async (req, res, next) => {
  try {
    if (isProduction()) {
      throw ApiError.forbidden('Demo login is disabled in production.');
    }
    const sequelize = getSequelize();
    const { role } = req.body;
    const user = await sequelize.models.User.findOne({
      where: { role: role || 'patient' },
      order: [['createdAt', 'ASC']],
    });
    if (!user) {
      throw ApiError.notFound(`No demo account found for role "${role}".`);
    }
    const token = generateToken(user);
    return successResponse(res, { user: publicUser(user), token }, 'Demo login successful.');
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const { email } = req.body;
    const user = await sequelize.models.User.findOne({ where: { email } });

    // Always respond generically so the endpoint cannot be used to enumerate
    // accounts. Only actually send when the account exists.
    if (user) {
      const rawToken = await issuePasswordResetToken(sequelize, user.id);
      await sendPasswordResetEmail({ to: user.email, name: user.name, token: rawToken });
    }

    return successResponse(res, null, GENERIC_RESET_MESSAGE);
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const { token, password } = req.body;
    const record = await sequelize.models.PasswordResetToken.findOne({
      where: { tokenHash: hashToken(token) },
    });
    if (!record || record.usedAt) {
      throw ApiError.badRequest('This reset link is invalid or has already been used. Request a new one.');
    }
    if (new Date(record.expiresAt) < new Date()) {
      throw ApiError.badRequest('This reset link has expired. Request a new one.');
    }

    const user = await sequelize.models.User.scope('withPassword').findByPk(record.userId);
    if (!user) {
      throw ApiError.notFound('Account not found.');
    }

    await sequelize.transaction(async (transaction) => {
      user.password = password;
      await user.save({ transaction });
      const now = new Date();
      record.usedAt = now;
      await record.save({ transaction });
      // Any other outstanding reset links are invalidated as well.
      await sequelize.models.PasswordResetToken.update(
        { usedAt: now },
        { where: { userId: user.id, usedAt: null }, transaction }
      );
    });

    return successResponse(res, null, 'Password reset successfully. You can now sign in.');
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const { token } = req.body;
    const record = await sequelize.models.EmailVerificationToken.findOne({
      where: { tokenHash: hashToken(token) },
    });
    if (!record || record.usedAt) {
      throw ApiError.badRequest('This verification link is invalid or has already been used. Request a new one.');
    }
    if (new Date(record.expiresAt) < new Date()) {
      throw ApiError.badRequest('This verification link has expired. Request a new one.');
    }

    await sequelize.transaction(async (transaction) => {
      const user = await sequelize.models.User.findByPk(record.userId, { transaction });
      if (!user) throw ApiError.notFound('Account not found.');
      user.emailVerified = true;
      await user.save({ transaction });
      const now = new Date();
      record.usedAt = now;
      await record.save({ transaction });
      await sequelize.models.EmailVerificationToken.update(
        { usedAt: now },
        { where: { userId: user.id, usedAt: null }, transaction }
      );
    });

    return successResponse(res, null, 'Your email address is verified. You can now sign in.');
  } catch (error) {
    return next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const { email } = req.body;
    const user = await sequelize.models.User.findOne({ where: { email } });

    // Generic response regardless of whether the account exists or is already
    // verified, so this endpoint cannot be used to enumerate accounts.
    if (user && !user.emailVerified) {
      const rawToken = await issueEmailVerificationToken(sequelize, user.id);
      await sendVerificationEmail({ to: user.email, name: user.name, token: rawToken });
    }

    return successResponse(res, null, GENERIC_RESEND_MESSAGE);
  } catch (error) {
    return next(error);
  }
};

export const stepUpRequest = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await sequelize.models.OtpToken.create({
      userId: req.user.id,
      purpose: req.body.purpose || 'step_up',
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const data = !isProduction() ? { devCode: code } : null;
    return successResponse(res, data, 'A one-time code has been sent to your email.');
  } catch (error) {
    return next(error);
  }
};

export const stepUpVerify = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const purpose = req.body.purpose || 'step_up';
    const record = await sequelize.models.OtpToken.findOne({
      where: { userId: req.user.id, purpose, consumedAt: null },
      order: [['createdAt', 'DESC']],
    });
    if (!record || new Date(record.expiresAt) < new Date()) {
      throw ApiError.badRequest('No active verification code. Request a new one.');
    }
    if (record.code !== req.body.code) {
      throw ApiError.badRequest('Incorrect or expired code.');
    }
    record.consumedAt = new Date();
    await record.save();
    return successResponse(res, { verified: true }, 'Verification successful.');
  } catch (error) {
    return next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const { name: nameField, firstName, lastName, email, password, phone, dateOfBirth } = req.body;
    const name = nameField || [firstName, lastName].filter(Boolean).join(' ').trim();

    const existing = await sequelize.models.User.findOne({ where: { email } });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const user = await sequelize.transaction(async (transaction) => {
      const created = await sequelize.models.User.create(
        {
          name,
          email,
          password,
          phone: phone || null,
          role: 'patient',
          emailVerified: false,
        },
        { transaction }
      );

      const [parsedFirst, ...rest] = name.trim().split(' ');
      await sequelize.models.Patient.create(
        {
          userId: created.id,
          firstName: parsedFirst,
          lastName: rest.join(' ') || parsedFirst,
          email,
          phone: phone || null,
          dateOfBirth: dateOfBirth || null,
        },
        { transaction }
      );

      return created;
    });

    // A verification email that fails must not be reported as sent. The account
    // is created (unverified) and the client can retry via resend-verification.
    const rawToken = await issueEmailVerificationToken(sequelize, user.id);
    await sendVerificationEmail({ to: user.email, name: user.name, token: rawToken });

    return createdResponse(
      res,
      { user: publicUser(user), emailSent: true },
      'Account created. Check your email to verify your address before signing in.'
    );
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const { email, password } = req.body;

    const user = await sequelize.models.User.scope('withPassword').findOne({
      where: { email },
    });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!user.emailVerified) {
      throw ApiError.forbidden(
        'Your email address is not verified yet. Check your inbox for the verification link, or request a new one.',
        [{ code: 'EMAIL_NOT_VERIFIED' }]
      );
    }

    const token = generateToken(user);
    return successResponse(res, { user: publicUser(user), token }, 'Login successful.');
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const user = await sequelize.models.User.findByPk(req.user.id, {
      include: [
        { model: sequelize.models.Patient, as: 'patientProfile' },
        { model: sequelize.models.Doctor, as: 'doctorProfile' },
      ],
    });
    return successResponse(res, user, 'Profile retrieved.');
  } catch (error) {
    return next(error);
  }
};
