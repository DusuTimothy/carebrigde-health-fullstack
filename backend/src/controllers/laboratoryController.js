import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { resolvePatientScope } from '../utils/scope.js';
import { ApiError } from '../utils/errors.js';

const labIncludes = (models) => [
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

export const listLaboratoryTests = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};

    const scope = await resolvePatientScope(req);
    if (scope) where.patientId = scope;
    if (req.query.patientId && !scope) where.patientId = req.query.patientId;
    if (req.query.doctorId) where.doctorId = req.query.doctorId;
    if (req.query.status) where.status = req.query.status;
    if (req.query.search) {
      where[Op.or] = [
        { testName: { [Op.iLike]: `%${req.query.search}%` } },
        { testType: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows, count } = await models.LaboratoryTest.findAndCountAll({
      where,
      include: labIncludes(models),
      order: [['requestedAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return listResponse(res, rows, buildPagination(page, limit, count));
  } catch (error) {
    return next(error);
  }
};

export const getLaboratoryTest = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const test = await models.LaboratoryTest.findByPk(req.params.id, {
      include: labIncludes(models),
    });
    if (!test) throw ApiError.notFound('Laboratory test not found.');

    const scope = await resolvePatientScope(req);
    if (scope && test.patientId !== scope) {
      throw ApiError.notFound('Laboratory test not found.');
    }
    return successResponse(res, test);
  } catch (error) {
    return next(error);
  }
};

export const createLaboratoryTest = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const payload = { ...req.body };

    const patient = await models.Patient.findByPk(payload.patientId);
    if (!patient) throw ApiError.notFound('Patient not found.');

    if (payload.doctorId) {
      const doctor = await models.Doctor.findByPk(payload.doctorId);
      if (!doctor) throw ApiError.notFound('Doctor not found.');
    }

    if (!payload.requestedAt) payload.requestedAt = new Date();

    const test = await models.LaboratoryTest.create(payload);
    const created = await models.LaboratoryTest.findByPk(test.id, {
      include: labIncludes(models),
    });
    return createdResponse(res, created, 'Laboratory test created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateLaboratoryTest = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const test = await models.LaboratoryTest.findByPk(req.params.id);
    if (!test) throw ApiError.notFound('Laboratory test not found.');

    const payload = { ...req.body };
    delete payload.patientId;

    if (payload.doctorId) {
      const doctor = await models.Doctor.findByPk(payload.doctorId);
      if (!doctor) throw ApiError.notFound('Doctor not found.');
    }

    if (payload.status === 'completed' && !payload.completedAt && !test.completedAt) {
      payload.completedAt = new Date();
    }

    await test.update(payload);
    const updated = await models.LaboratoryTest.findByPk(test.id, {
      include: labIncludes(models),
    });
    return successResponse(res, updated, 'Laboratory test updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteLaboratoryTest = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const test = await models.LaboratoryTest.findByPk(req.params.id);
    if (!test) throw ApiError.notFound('Laboratory test not found.');
    await test.destroy();
    return successResponse(res, null, 'Laboratory test deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
