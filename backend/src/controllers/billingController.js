import billingService from '../services/billingService.js';
import { successResponse, createdResponse, listResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';
import { resolvePatientScope } from '../utils/scope.js';

export const listBills = async (req, res, next) => {
  try {
    const scope = await resolvePatientScope(req);
    const { data, pagination } = await billingService.getAllBills(req.query, scope);
    return listResponse(res, data, pagination);
  } catch (error) {
    return next(error);
  }
};

export const getBill = async (req, res, next) => {
  try {
    const scope = await resolvePatientScope(req);
    const bill = await billingService.getBillById(req.params.id, scope);
    return successResponse(res, bill);
  } catch (error) {
    return next(error);
  }
};

export const createBill = async (req, res, next) => {
  try {
    const bill = await billingService.createBill(req.body);
    return createdResponse(res, bill, 'Bill created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateBill = async (req, res, next) => {
  try {
    const bill = await billingService.updateBill(req.params.id, req.body);
    return successResponse(res, bill, 'Bill updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    if (req.user.role === 'patient') {
      const scope = await resolvePatientScope(req);
      const existing = await billingService.getBillById(req.params.id, scope);
      if (!existing) {
        throw ApiError.forbidden('You can only pay your own bills.');
      }
    }
    const bill = await billingService.recordPayment(req.params.id, req.body.amount);
    return successResponse(res, bill, 'Payment recorded successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteBill = async (req, res, next) => {
  try {
    await billingService.deleteBill(req.params.id);
    return successResponse(res, null, 'Bill deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
