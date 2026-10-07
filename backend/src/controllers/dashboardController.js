import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse } from '../utils/apiResponse.js';
import { resolvePatientScope } from '../utils/scope.js';
import { ApiError } from '../utils/errors.js';

const today = () => new Date().toISOString().slice(0, 10);

const sum = async (Model, field, where = null) => {
  const value = await Model.sum(field, { where: where || undefined });
  return Number(value || 0);
};

const coreStats = async () => {
  const models = getSequelize().models;
  const s = getSequelize();
  const day = today();

  const [
    totalPatients,
    todayAppointments,
    currentAdmissions,
    availableBeds,
    occupiedBeds,
    totalBeds,
    totalDoctors,
    totalDepartments,
    pendingLabTests,
    pendingPrescriptions,
    pendingOrders,
    prescriptionPendingOrders,
    revenue,
    outstandingBills,
    lowStockProducts,
    outOfStockProducts,
  ] = await Promise.all([
    models.Patient.count(),
    models.Appointment.count({ where: { appointmentDate: day } }),
    models.Admission.count({ where: { status: { [Op.in]: ['admitted', 'transferred'] } } }),
    models.Bed.count({ where: { status: 'available' } }),
    models.Bed.count({ where: { status: 'occupied' } }),
    models.Bed.count(),
    models.Doctor.count(),
    models.Department.count({ where: { status: 'active' } }),
    models.LaboratoryTest.count({
      where: { status: { [Op.in]: ['requested', 'sample-collected', 'processing'] } },
    }),
    models.Prescription.count({ where: { status: 'pending' } }),
    models.Order.count({
      where: { status: { [Op.in]: ['pending', 'confirmed', 'processing'] } },
    }),
    models.Order.count({ where: { prescriptionStatus: 'pending' } }),
    sum(models.Bill, 'amountPaid'),
    sum(models.Bill, 'balance', { status: { [Op.in]: ['pending', 'partially-paid'] } }),
    models.Product.count({
      where: {
        [Op.and]: [
          { stockQuantity: { [Op.gt]: 0 } },
          s.where(s.col('"Product"."stockQuantity"'), Op.lte, s.col('"Product"."minimumStock"')),
        ],
      },
    }),
    models.Product.count({ where: { stockQuantity: 0 } }),
  ]);

  return {
    totalPatients,
    todayAppointments,
    currentAdmissions,
    availableBeds,
    occupiedBeds,
    totalBeds,
    totalDoctors,
    totalDepartments,
    pendingLaboratoryTests: pendingLabTests,
    pendingPrescriptions,
    pendingOrders,
    prescriptionPendingOrders,
    revenue,
    outstandingBills,
    lowStockProducts,
    outOfStockProducts,
  };
};

export const adminDashboard = async (req, res, next) => {
  try {
    const stats = await coreStats();
    const models = getSequelize().models;

    const admissionsByWard = await models.Admission.findAll({
      where: { status: { [Op.in]: ['admitted', 'transferred'] } },
      attributes: [
        'wardId',
        [getSequelize().fn('COUNT', getSequelize().col('id')), 'count'],
      ],
      group: ['wardId'],
      raw: true,
    });

    const appointmentsByStatus = await models.Appointment.findAll({
      where: { appointmentDate: today() },
      attributes: ['status', [getSequelize().fn('COUNT', getSequelize().col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    return successResponse(res, {
      ...stats,
      admissionsByWard,
      appointmentsByStatus,
    });
  } catch (error) {
    return next(error);
  }
};

export const doctorDashboard = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const doctor = await models.Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) throw ApiError.notFound('No doctor profile linked to this account.');

    const day = today();
    const [todaysAppointments, pendingPrescriptions, activeAdmissions, completedToday] =
      await Promise.all([
        models.Appointment.count({
          where: { doctorId: doctor.id, appointmentDate: day },
        }),
        models.Prescription.count({
          where: { doctorId: doctor.id, status: 'pending' },
        }),
        models.Admission.count({
          where: { doctorId: doctor.id, status: { [Op.in]: ['admitted', 'transferred'] } },
        }),
        models.Appointment.count({
          where: {
            doctorId: doctor.id,
            appointmentDate: day,
            status: { [Op.in]: ['completed', 'in-consultation', 'checked-in'] },
          },
        }),
      ]);

    const upcomingAppointments = await models.Appointment.findAll({
      where: {
        doctorId: doctor.id,
        appointmentDate: { [Op.gte]: day },
        status: { [Op.in]: ['scheduled', 'confirmed'] },
      },
      include: [
        {
          model: models.Patient,
          as: 'patient',
          attributes: ['id', 'patientNumber', 'firstName', 'lastName'],
        },
      ],
      order: [
        ['appointmentDate', 'ASC'],
        ['appointmentTime', 'ASC'],
      ],
      limit: 5,
    });

    return successResponse(res, {
      doctor,
      todaysAppointments,
      completedToday,
      pendingPrescriptions,
      activeAdmissions,
      upcomingAppointments,
    });
  } catch (error) {
    return next(error);
  }
};

export const nurseDashboard = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const day = today();

    const [currentAdmissions, availableBeds, occupiedBeds, todayAppointments, pendingLabTests] =
      await Promise.all([
        models.Admission.count({ where: { status: { [Op.in]: ['admitted', 'transferred'] } } }),
        models.Bed.count({ where: { status: 'available' } }),
        models.Bed.count({ where: { status: 'occupied' } }),
        models.Appointment.count({ where: { appointmentDate: day } }),
        models.LaboratoryTest.count({
          where: { status: { [Op.in]: ['requested', 'sample-collected', 'processing'] } },
        }),
      ]);

    const recentAdmissions = await models.Admission.findAll({
      where: { status: { [Op.in]: ['admitted', 'transferred'] } },
      include: [
        { model: models.Patient, as: 'patient', attributes: ['id', 'patientNumber', 'firstName', 'lastName'] },
        { model: models.Ward, as: 'ward' },
        { model: models.Bed, as: 'bed' },
        { model: models.Doctor, as: 'doctor', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return successResponse(res, {
      currentAdmissions,
      availableBeds,
      occupiedBeds,
      todayAppointments,
      pendingLaboratoryTests: pendingLabTests,
      recentAdmissions,
    });
  } catch (error) {
    return next(error);
  }
};

export const pharmacyDashboard = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const s = getSequelize();

    const [
      pendingOrders,
      processingOrders,
      prescriptionPendingOrders,
      pendingPrescriptions,
      lowStockProducts,
      outOfStockProducts,
      ordersRevenue,
      totalProducts,
    ] = await Promise.all([
      models.Order.count({ where: { status: 'pending' } }),
      models.Order.count({ where: { status: { [Op.in]: ['confirmed', 'processing'] } } }),
      models.Order.count({ where: { prescriptionStatus: 'pending' } }),
      models.Prescription.count({ where: { status: 'pending' } }),
      models.Product.count({
        where: {
          [Op.and]: [
            { stockQuantity: { [Op.gt]: 0 } },
            s.where(s.col('"Product"."stockQuantity"'), Op.lte, s.col('"Product"."minimumStock"')),
          ],
        },
      }),
      models.Product.count({ where: { stockQuantity: 0 } }),
      sum(models.Order, 'total', { paymentStatus: 'paid' }),
      models.Product.count(),
    ]);

    const lowStockList = await models.Product.findAll({
      where: {
        [Op.and]: [
          { stockQuantity: { [Op.gt]: 0 } },
          s.where(s.col('"Product"."stockQuantity"'), Op.lte, s.col('"Product"."minimumStock"')),
          { status: 'active' },
        ],
      },
      include: [{ model: models.ProductCategory, as: 'category', attributes: ['id', 'name'] }],
      order: [['stockQuantity', 'ASC']],
      limit: 8,
    });

    return successResponse(res, {
      pendingOrders,
      processingOrders,
      prescriptionPendingOrders,
      pendingPrescriptions,
      lowStockProducts,
      outOfStockProducts,
      ordersRevenue,
      totalProducts,
      lowStockList,
    });
  } catch (error) {
    return next(error);
  }
};

export const patientDashboard = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const day = today();

    const scope = await resolvePatientScope(req);
    if (!scope || scope.startsWith('00000000')) {
      throw ApiError.notFound('No patient profile linked to this account.');
    }

    const [upcomingAppointments, activeAdmissions, pendingPrescriptions, pendingBills, labTests] =
      await Promise.all([
        models.Appointment.count({
          where: {
            patientId: scope,
            appointmentDate: { [Op.gte]: day },
            status: { [Op.in]: ['scheduled', 'confirmed'] },
          },
        }),
        models.Admission.count({
          where: { patientId: scope, status: { [Op.in]: ['admitted', 'transferred'] } },
        }),
        models.Prescription.count({ where: { patientId: scope, status: 'pending' } }),
        sum(models.Bill, 'balance', {
          patientId: scope,
          status: { [Op.in]: ['pending', 'partially-paid'] },
        }),
        models.LaboratoryTest.count({
          where: {
            patientId: scope,
            status: { [Op.in]: ['requested', 'sample-collected', 'processing'] },
          },
        }),
      ]);

    const nextAppointments = await models.Appointment.findAll({
      where: {
        patientId: scope,
        appointmentDate: { [Op.gte]: day },
        status: { [Op.in]: ['scheduled', 'confirmed'] },
      },
      include: [
        {
          model: models.Doctor,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'specialization'],
        },
        { model: models.Department, as: 'department' },
      ],
      order: [
        ['appointmentDate', 'ASC'],
        ['appointmentTime', 'ASC'],
      ],
      limit: 5,
    });

    return successResponse(res, {
      upcomingAppointments,
      activeAdmissions,
      pendingPrescriptions,
      outstandingBalance: pendingBills,
      pendingLaboratoryTests: labTests,
      nextAppointments,
    });
  } catch (error) {
    return next(error);
  }
};
