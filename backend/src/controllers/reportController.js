import { QueryTypes } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

export const getReports = async (req, res, next) => {
  try {
    if (!['admin', 'accountant'].includes(req.user.role)) {
      throw ApiError.forbidden('You are not allowed to view reports.');
    }
    const sequelize = getSequelize();
    const models = sequelize.models;

    const revenueRows = await sequelize
      .query(
        `SELECT to_char("createdAt", 'Mon') AS "month", sum("amountPaid") AS revenue
           FROM bills GROUP BY to_char("createdAt", 'Mon') ORDER BY min("createdAt")`,
        { type: QueryTypes.SELECT }
      )
      .catch(() => []);

    const [
      paidBills,
      cancelledBills,
      visits,
      noShows,
      admissions,
      wards,
      totalPatients,
    ] = await Promise.all([
      models.Bill.count({ where: { status: { [sequelize.Sequelize.Op.in]: ['paid', 'partially-paid'] } } }),
      models.Bill.count({ where: { status: 'cancelled' } }),
      models.Appointment.count(),
      models.Appointment.count({ where: { status: 'no-show' } }),
      models.Admission.count({ where: { status: 'admitted' } }),
      models.Ward.count(),
      models.Patient.count(),
    ]);

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('en-US', { month: 'short' });
    });

    const revenueByMonth = months.map((month) => {
      const match = revenueRows.find((r) => r.month === month);
      return {
        month,
        revenue: match ? Number(match.revenue) : 0,
        visits,
        noShows,
      };
    });

    const wardRows = await models.Ward.findAll({
      include: [{ model: models.Bed, as: 'beds' }],
    });
    const occupancyByFacility = wardRows.map((ward) => {
      const beds = ward.beds?.length || 0;
      const occupied = (ward.beds || []).filter((b) => b.status === 'occupied').length;
      return {
        facility: ward.name,
        rate: beds ? Math.round((occupied / beds) * 100) : 0,
      };
    });

    const billRows = await models.Bill.findAll({
      include: [{ model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user' }] }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    const claims = billRows.map((bill) => {
      const patient = bill.patient?.toJSON?.() || {};
      return {
        id: bill.id,
        patient: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
        payer: patient.insuranceProvider || 'Self-pay',
        amount: Number(bill.totalAmount),
        status: bill.status,
      };
    });

    return successResponse(res, {
      revenueByMonth,
      occupancyByFacility,
      claims,
      summary: {
        totalPatients,
        activeAdmissions: admissions,
        noShows,
        paidBills,
        cancelledBills,
        totalWards: wards
      },
    });
  } catch (error) {
    return next(error);
  }
};