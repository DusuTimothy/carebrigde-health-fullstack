import crypto from 'node:crypto';
import { getSequelize } from '../config/database.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { successResponse, createdResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

const publicUser = (user) => {
  const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  delete json.password;
  return json;
};

const isProduction = () => process.env.NODE_ENV === 'production';

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
    const user = await sequelize.models.User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return successResponse(res, null, 'If that account exists, a reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await sequelize.models.PasswordResetToken.create({
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    if (!isProduction()) {
      return successResponse(
        res,
        { email: user.email, resetToken },
        'Reset token generated (returned in development for demo purposes).'
      );
    }
    return successResponse(res, null, 'If that account exists, a reset link has been sent.');
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const record = await sequelize.models.PasswordResetToken.findOne({
      where: { token: req.body.token },
    });
    if (!record || record.usedAt) {
      throw ApiError.badRequest('Invalid or already-used reset token.');
    }
    if (new Date(record.expiresAt) < new Date()) {
      throw ApiError.badRequest('This reset token has expired. Request a new one.');
    }

    const user = await sequelize.models.User.scope('withPassword').findByPk(record.userId);
    if (!user) {
      throw ApiError.notFound('Account not found.');
    }

    await sequelize.transaction(async (transaction) => {
      user.password = req.body.password;
      await user.save({ transaction });
      record.usedAt = new Date();
      await record.save({ transaction });
    });

    return successResponse(res, null, 'Password reset successfully. You can now sign in.');
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

    const { user, token } = await sequelize.transaction(async (transaction) => {
      const user = await sequelize.models.User.create(
        {
          name,
          email,
          password,
          phone: phone || null,
          role: 'patient',
        },
        { transaction }
      );

      const [parsedFirst, ...rest] = name.trim().split(' ');
      await sequelize.models.Patient.create(
        {
          userId: user.id,
          firstName: parsedFirst,
          lastName: rest.join(' ') || parsedFirst,
          email,
          phone: phone || null,
          dateOfBirth: dateOfBirth || null,
        },
        { transaction }
      );

      const token = generateToken(user);
      return { user, token };
    });

    return createdResponse(res, { user: publicUser(user), token }, 'Registration successful.');
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
