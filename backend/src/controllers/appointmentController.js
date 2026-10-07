import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { resolvePatientScope } from '../utils/scope.js';
import { ApiError } from '../utils/errors.js';

const appointmentIncludes = (models) => [
  {
    model: models.Patient,
    as: 'patient',
    attributes: ['id', 'patientNumber', 'firstName', 'lastName', 'phone', 'email'],
  },
  {
    model: models.Doctor,
    as: 'doctor',
    attributes: ['id', 'firstName', 'lastName', 'specialization', 'image'],
  },
  { model: models.Department, as: 'department' },
];

export const listAppointments = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};

    const scope = await resolvePatientScope(req);
    if (scope) where.patientId = scope;
    if (req.query.patientId && !scope) where.patientId = req.query.patientId;
    if (req.query.doctorId) where.doctorId = req.query.doctorId;
    if (req.query.departmentId) where.departmentId = req.query.departmentId;
    if (req.query.status) where.status = req.query.status;
    if (req.query.date) where.appointmentDate = req.query.date;
    if (req.query.startDate || req.query.endDate) {
      where.appointmentDate = {};
      if (req.query.startDate) where.appointmentDate[Op.gte] = req.query.startDate;
      if (req.query.endDate) where.appointmentDate[Op.lte] = req.query.endDate;
    }
    if (req.query.search) {
      where[Op.or] = [
        { reason: { [Op.iLike]: `%${req.query.search}%` } },
        { notes: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows, count } = await models.Appointment.findAndCountAll({
      where,
      include: appointmentIncludes(models),
      order: [
        ['appointmentDate', 'ASC'],
        ['appointmentTime', 'ASC'],
      ],
      limit,
      offset,
      distinct: true,
    });

    return listResponse(res, rows, buildPagination(page, limit, count));
  } catch (error) {
    return next(error);
  }
};

export const getAppointment = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const appointment = await models.Appointment.findByPk(req.params.id, {
      include: appointmentIncludes(models),
    });
    if (!appointment) throw ApiError.notFound('Appointment not found.');

    const scope = await resolvePatientScope(req);
    if (scope && appointment.patientId !== scope) {
      throw ApiError.notFound('Appointment not found.');
    }
    return successResponse(res, appointment);
  } catch (error) {
    return next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const payload = { ...req.body };

    const scope = await resolvePatientScope(req);
    if (scope) {
      if (scope.startsWith('00000000')) {
        throw ApiError.forbidden('No patient profile linked to this account.');
      }
      payload.patientId = scope;
    }

    const patient = await models.Patient.findByPk(payload.patientId);
    if (!patient) throw ApiError.notFound('Patient not found.');

    const doctor = await models.Doctor.findByPk(payload.doctorId);
    if (!doctor) throw ApiError.notFound('Doctor not found.');

    if (!payload.departmentId) payload.departmentId = doctor.departmentId;

    const appointment = await models.Appointment.create(payload);
    const created = await models.Appointment.findByPk(appointment.id, {
      include: appointmentIncludes(models),
    });
    return createdResponse(res, created, 'Appointment created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const appointment = await models.Appointment.findByPk(req.params.id);
    if (!appointment) throw ApiError.notFound('Appointment not found.');

    const scope = await resolvePatientScope(req);
    if (scope && appointment.patientId !== scope) {
      throw ApiError.notFound('Appointment not found.');
    }

    if (req.body.doctorId) {
      const doctor = await models.Doctor.findByPk(req.body.doctorId);
      if (!doctor) throw ApiError.notFound('Doctor not found.');
      if (!req.body.departmentId) req.body.departmentId = doctor.departmentId;
    }

    await appointment.update(req.body);
    const updated = await models.Appointment.findByPk(appointment.id, {
      include: appointmentIncludes(models),
    });
    return successResponse(res, updated, 'Appointment updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const appointment = await models.Appointment.findByPk(req.params.id);
    if (!appointment) throw ApiError.notFound('Appointment not found.');
    await appointment.destroy();
    return successResponse(res, null, 'Appointment deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
