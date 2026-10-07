import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { resolvePatientScope } from '../utils/scope.js';
import { ApiError } from '../utils/errors.js';

const prescriptionIncludes = (models) => [
  {
    model: models.Patient,
    as: 'patient',
    attributes: ['id', 'patientNumber', 'firstName', 'lastName'],
  },
  {
    model: models.Doctor,
    as: 'doctor',
    attributes: ['id', 'firstName', 'lastName', 'specialization'],
  },
  { model: models.Product, as: 'medicine' },
];

const resolveOwnDoctorId = async (req) => {
  if (req.user?.role !== 'doctor') return null;
  const doctor = await getSequelize().models.Doctor.findOne({
    where: { userId: req.user.id },
    attributes: ['id'],
  });
  return doctor ? doctor.id : '__none__';
};

export const listPrescriptions = async (req, res, next) => {
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
        { dosage: { [Op.iLike]: `%${req.query.search}%` } },
        { instructions: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows, count } = await models.Prescription.findAndCountAll({
      where,
      include: prescriptionIncludes(models),
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

export const getPrescription = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const prescription = await models.Prescription.findByPk(req.params.id, {
      include: prescriptionIncludes(models),
    });
    if (!prescription) throw ApiError.notFound('Prescription not found.');

    const scope = await resolvePatientScope(req);
    if (scope && prescription.patientId !== scope) {
      throw ApiError.notFound('Prescription not found.');
    }
    return successResponse(res, prescription);
  } catch (error) {
    return next(error);
  }
};

export const createPrescription = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const payload = { ...req.body };

    const patient = await models.Patient.findByPk(payload.patientId);
    if (!patient) throw ApiError.notFound('Patient not found.');

    if (payload.medicineId) {
      const medicine = await models.Product.findByPk(payload.medicineId);
      if (!medicine) throw ApiError.notFound('Medicine product not found.');
    }

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

    const prescription = await models.Prescription.create(payload);
    const created = await models.Prescription.findByPk(prescription.id, {
      include: prescriptionIncludes(models),
    });
    return createdResponse(res, created, 'Prescription created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updatePrescription = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const prescription = await models.Prescription.findByPk(req.params.id);
    if (!prescription) throw ApiError.notFound('Prescription not found.');

    const payload = { ...req.body };
    delete payload.patientId;

    if (payload.medicineId) {
      const medicine = await models.Product.findByPk(payload.medicineId);
      if (!medicine) throw ApiError.notFound('Medicine product not found.');
    }

    await prescription.update(payload);
    const updated = await models.Prescription.findByPk(prescription.id, {
      include: prescriptionIncludes(models),
    });
    return successResponse(res, updated, 'Prescription updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deletePrescription = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const prescription = await models.Prescription.findByPk(req.params.id);
    if (!prescription) throw ApiError.notFound('Prescription not found.');
    await prescription.destroy();
    return successResponse(res, null, 'Prescription deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
