import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { resolvePatientScope } from '../utils/scope.js';
import { ApiError } from '../utils/errors.js';

const recordIncludes = (models) => [
  {
    model: models.Patient,
    as: 'patient',
    attributes: ['id', 'patientNumber', 'firstName', 'lastName', 'dateOfBirth', 'gender'],
  },
  {
    model: models.Doctor,
    as: 'doctor',
    attributes: ['id', 'firstName', 'lastName', 'specialization'],
  },
];

const resolveOwnDoctorId = async (req) => {
  if (req.user?.role !== 'doctor') return null;
  const doctor = await getSequelize().models.Doctor.findOne({
    where: { userId: req.user.id },
    attributes: ['id'],
  });
  return doctor ? doctor.id : '__none__';
};

export const listMedicalRecords = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};

    const scope = await resolvePatientScope(req);
    if (scope) where.patientId = scope;
    if (req.query.patientId && !scope) where.patientId = req.query.patientId;
    if (req.query.doctorId) where.doctorId = req.query.doctorId;
    if (req.query.search) {
      where[Op.or] = [
        { diagnosis: { [Op.iLike]: `%${req.query.search}%` } },
        { symptoms: { [Op.iLike]: `%${req.query.search}%` } },
        { treatment: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows, count } = await models.MedicalRecord.findAndCountAll({
      where,
      include: recordIncludes(models),
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return listResponse(res, rows, buildPagination(page, limit, count));
  } catch (error) {
    return next(error);
  }
};

export const getMedicalRecord = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const record = await models.MedicalRecord.findByPk(req.params.id, {
      include: recordIncludes(models),
    });
    if (!record) throw ApiError.notFound('Medical record not found.');

    const scope = await resolvePatientScope(req);
    if (scope && record.patientId !== scope) {
      throw ApiError.notFound('Medical record not found.');
    }
    return successResponse(res, record);
  } catch (error) {
    return next(error);
  }
};

export const createMedicalRecord = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const payload = { ...req.body };

    const patient = await models.Patient.findByPk(payload.patientId);
    if (!patient) throw ApiError.notFound('Patient not found.');

    if (payload.doctorId) {
      const doctor = await models.Doctor.findByPk(payload.doctorId);
      if (!doctor) throw ApiError.notFound('Doctor not found.');
    } else if (req.user.role === 'doctor') {
      const ownDoctorId = await resolveOwnDoctorId(req);
      if (!ownDoctorId || ownDoctorId === '__none__') {
        throw ApiError.forbidden('No doctor profile linked to this account.');
      }
      payload.doctorId = ownDoctorId;
    } else {
      throw ApiError.badRequest('doctorId is required.');
    }

    const record = await models.MedicalRecord.create(payload);
    const created = await models.MedicalRecord.findByPk(record.id, {
      include: recordIncludes(models),
    });
    return createdResponse(res, created, 'Medical record created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateMedicalRecord = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const record = await models.MedicalRecord.findByPk(req.params.id);
    if (!record) throw ApiError.notFound('Medical record not found.');

    const payload = { ...req.body };
    delete payload.patientId;

    if (payload.doctorId) {
      const doctor = await models.Doctor.findByPk(payload.doctorId);
      if (!doctor) throw ApiError.notFound('Doctor not found.');
    }

    await record.update(payload);
    const updated = await models.MedicalRecord.findByPk(record.id, {
      include: recordIncludes(models),
    });
    return successResponse(res, updated, 'Medical record updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteMedicalRecord = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const record = await models.MedicalRecord.findByPk(req.params.id);
    if (!record) throw ApiError.notFound('Medical record not found.');
    await record.destroy();
    return successResponse(res, null, 'Medical record deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
