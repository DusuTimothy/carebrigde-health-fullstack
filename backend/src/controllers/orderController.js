import { getSequelize } from '../config/database.js';
import orderService from '../services/orderService.js';
import { successResponse, createdResponse, listResponse } from '../utils/apiResponse.js';
import { resolvePatientScope } from '../utils/scope.js';
import { ApiError } from '../utils/errors.js';

export const listOrders = async (req, res, next) => {
  try {
    const scope = await resolvePatientScope(req);
    const scopeUserId = scope ? req.user.id : null;

    const { data, pagination } = await orderService.getAllOrders(req.query, scopeUserId);
    return listResponse(res, data, pagination);
  } catch (error) {
    return next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    const scope = await resolvePatientScope(req);
    if (scope && order.userId !== req.user.id) {
      throw ApiError.notFound('Order not found.');
    }
    return successResponse(res, order);
  } catch (error) {
    return next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    let patientId = req.body.patientId || null;

    if (req.user.role === 'patient') {
      const profile = await getSequelize().models.Patient.findOne({
        where: { userId: req.user.id },
      });
      patientId = profile ? profile.id : null;
    }

    const order = await orderService.createOrder({
      userId: req.user.id,
      patientId,
      items: req.body.items,
      deliveryAddress: req.body.deliveryAddress || null,
    });

    return createdResponse(res, order, 'Order placed successfully.');
  } catch (error) {
    return next(error);
  }
};

export const verifyOrderPrescription = async (req, res, next) => {
  try {
    const order = await orderService.verifyPrescription(req.params.id, req.body.decision);
    return successResponse(res, order, `Prescription ${req.body.decision} successfully.`);
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body);
    return successResponse(res, order, 'Order updated successfully.');
  } catch (error) {
    return next(error);
  }
};
