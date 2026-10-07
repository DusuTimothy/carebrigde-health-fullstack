import { getSequelize } from '../config/database.js';
import { createdResponse, successResponse, listResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

const CHECKIN_ROLES = ['admin', 'nurse', 'receptionist'];

export const listCheckins = async (req, res, next) => {
  try {
    if (!CHECKIN_ROLES.includes(req.user.role)) {
      throw ApiError.forbidden('You are not allowed to view check-ins.');
    }
    const models = getSequelize().models;
    const checkins = await models.Checkin.findAll({
      include: [
        { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user' }] },
        { model: models.Doctor, as: 'doctor', include: [{ model: models.User, as: 'user' }] },
      ],
      order: [['arrivedAt', 'DESC']],
    });
    return listResponse(res, checkins);
  } catch (error) {
    return next(error);
  }
};

export const createCheckin = async (req, res, next) => {
  try {
    if (!CHECKIN_ROLES.includes(req.user.role)) {
      throw ApiError.forbidden('You are not allowed to start a check-in.');
    }
    const models = getSequelize().models;
    const checkin = await models.Checkin.create({ ...req.body, arrivedAt: new Date() });
    const full = await models.Checkin.findByPk(checkin.id, {
      include: [
        { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user' }] },
        { model: models.Doctor, as: 'doctor', include: [{ model: models.User, as: 'user' }] },
      ],
    });
    return createdResponse(res, full, 'Patient checked in.');
  } catch (error) {
    return next(error);
  }
};

export const updateCheckin = async (req, res, next) => {
  try {
    if (!CHECKIN_ROLES.includes(req.user.role)) {
      throw ApiError.forbidden('You are not allowed to update check-ins.');
    }
    const models = getSequelize().models;
    const checkin = await models.Checkin.findByPk(req.params.id);
    if (!checkin) throw ApiError.notFound('Check-in not found.');

    const { status, ...rest } = req.body;
    await checkin.update({
      ...rest,
      ...(status ? { status, completedAt: status === 'completed' ? new Date() : checkin.completedAt } : {}),
    });
    const full = await models.Checkin.findByPk(checkin.id, {
      include: [
        { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user' }] },
        { model: models.Doctor, as: 'doctor', include: [{ model: models.User, as: 'user' }] },
      ],
    });
    return successResponse(res, full, 'Check-in updated.');
  } catch (error) {
    return next(error);
  }
};