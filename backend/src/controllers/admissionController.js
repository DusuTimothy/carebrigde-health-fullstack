import admissionService from '../services/admissionService.js';
import { successResponse, createdResponse, listResponse } from '../utils/apiResponse.js';
import { resolvePatientScope } from '../utils/scope.js';
import { ApiError } from '../utils/errors.js';

export const listAdmissions = async (req, res, next) => {
  try {
    const scope = await resolvePatientScope(req);
    const query = { ...req.query };
    if (scope) query.patientId = scope;

    const { data, pagination } = await admissionService.getAllAdmissions(query);
    return listResponse(res, data, pagination);
  } catch (error) {
    return next(error);
  }
};

export const getAdmission = async (req, res, next) => {
  try {
    const scope = await resolvePatientScope(req);
    const admission = await admissionService.getAdmissionById(req.params.id);
    if (scope && admission.patientId !== scope) {
      throw ApiError.notFound('Admission not found.');
    }
    return successResponse(res, admission);
  } catch (error) {
    return next(error);
  }
};

export const createAdmission = async (req, res, next) => {
  try {
    const admission = await admissionService.admitPatient(req.body);
    return createdResponse(res, admission, 'Patient admitted successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateAdmission = async (req, res, next) => {
  try {
    const admission = await admissionService.updateAdmission(req.params.id, req.body);
    return successResponse(res, admission, 'Admission updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const transferAdmission = async (req, res, next) => {
  try {
    const admission = await admissionService.transferAdmission(
      req.params.id,
      req.body,
      req.user?.id || null
    );
    return successResponse(res, admission, 'Patient transferred successfully.');
  } catch (error) {
    return next(error);
  }
};

export const dischargeAdmission = async (req, res, next) => {
  try {
    const admission = await admissionService.dischargeAdmission(req.params.id, req.body);
    return successResponse(res, admission, 'Patient discharged successfully.');
  } catch (error) {
    return next(error);
  }
};

export const cancelAdmission = async (req, res, next) => {
  try {
    const admission = await admissionService.cancelAdmission(req.params.id);
    return successResponse(res, admission, 'Admission cancelled.');
  } catch (error) {
    return next(error);
  }
};

export const deleteAdmission = async (req, res, next) => {
  try {
    const admission = await admissionService.getAdmissionById(req.params.id);
    await admission.destroy();
    return successResponse(res, null, 'Admission deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
