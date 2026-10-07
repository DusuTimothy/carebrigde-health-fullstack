import { ApiError } from '../utils/errors.js';

const isSequelizeError = (err) => err && typeof err.name === 'string' && err.name.startsWith('Sequelize');

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = 'Internal server error';
  let errors = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues?.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = (err.errors || []).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'A record with that value already exists.';
    errors = (err.errors || []).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 409;
    message = 'Related record is referenced and cannot be modified.';
  } else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    message = 'Database error occurred.';
    if (process.env.NODE_ENV !== 'production') message = err.message;
  } else if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(err.name)) {
    statusCode = 401;
    message = 'Invalid or expired token.';
  } else if (err.name === 'MulterError' || (isSequelizeError(err) && err instanceof Error)) {
    statusCode = err.statusCode || 400;
    message = err.message;
  } else if (err.statusCode || err.status) {
    statusCode = err.statusCode || err.status;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal server error';
      errors = null;
    }
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500 && err.stack) {
    body.stack = err.stack;
  }

  return res.status(statusCode).json(body);
};
