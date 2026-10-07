import patientService from '../services/patientService.js';
import { successResponse, createdResponse, listResponse } from '../utils/apiResponse.js';
import { resolvePatientScope } from '../utils/scope.js';
import { ApiError } from '../utils/errors.js';

export const listPatients = async (req, res, next) => {
  try {
    const scope = await resolvePatientScope(req);
    if (scope) {
      const patient = await patientService.getPatientById(scope).catch(() => null);
      return listResponse(res, patient ? [patient] : [], {
        page: 1,
        limit: 1,
        total: patient ? 1 : 0,
        totalPages: 1,
      });
    }
    const { data, pagination } = await patientService.getAllPatients(req.query);
    return listResponse(res, data, pagination);
  } catch (error) {
    return next(error);
  }
};

export const getPatient = async (req, res, next) => {
  try {
    const scope = await resolvePatientScope(req);
    if (scope && scope !== req.params.id) {
      throw ApiError.notFound('Patient not found.');
    }
    const patient = await patientService.getPatientById(req.params.id);
    return successResponse(res, patient);
  } catch (error) {
    return next(error);
  }
};

export const getMyPatientProfile = async (req, res, next) => {
  try {
    const scope = await resolvePatientScope(req);
    if (!scope || scope.startsWith('00000000')) {
      throw ApiError.notFound('No patient profile linked to this account.');
    }
    const patient = await patientService.getPatientById(scope);
    return successResponse(res, patient);
  } catch (error) {
    return next(error);
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.body);
    return createdResponse(res, patient, 'Patient created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const scope = await resolvePatientScope(req);
    if (scope && scope !== req.params.id) {
      throw ApiError.notFound('Patient not found.');
    }
    const patient = await patientService.updatePatient(req.params.id, req.body);
    return successResponse(res, patient, 'Patient updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    await patientService.deletePatient(req.params.id);
    return successResponse(res, null, 'Patient deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
