import { getSequelize } from '../config/database.js';
import { createdResponse, listResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

export const listAuditLogs = async (req, res, next) => {
  try {
    if (!['admin', 'accountant'].includes(req.user.role)) {
      throw ApiError.forbidden('You are not allowed to view audit logs.');
    }
    const logs = await getSequelize().models.AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 500,
    });
    return listResponse(res, logs);
  } catch (error) {
    return next(error);
  }
};

export const createAuditLog = async (req, res, next) => {
  try {
    if (!['admin', 'accountant'].includes(req.user.role)) {
      throw ApiError.forbidden('You are not allowed to write audit logs.');
    }
    const log = await getSequelize().models.AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      action: req.body.action,
      target: req.body.target || null,
      detail: req.body.detail || null,
    });
    return createdResponse(res, log, 'Audit log recorded.');
  } catch (error) {
    return next(error);
  }
};