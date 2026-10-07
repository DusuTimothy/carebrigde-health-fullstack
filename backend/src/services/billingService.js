import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { ApiError } from '../utils/errors.js';
import { parsePagination, buildPagination } from '../utils/apiResponse.js';

const FEE_FIELDS = ['consultationFee', 'bedFee', 'laboratoryFee', 'pharmacyFee', 'otherCharges'];

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const deriveStatus = (totalAmount, amountPaid, currentStatus) => {
  if (currentStatus === 'cancelled') return 'cancelled';
  if (amountPaid <= 0) return 'pending';
  if (amountPaid + 0.009 < totalAmount) return 'partially-paid';
  return 'paid';
};

const computeTotals = (fields) => {
  const totalAmount = round2(FEE_FIELDS.reduce((sum, field) => sum + Number(fields[field] || 0), 0));
  return totalAmount;
};

const billIncludes = (models) => [
  { model: models.Patient, as: 'patient' },
  {
    model: models.Admission,
    as: 'admission',
    include: [
      { model: models.Ward, as: 'ward' },
      { model: models.Bed, as: 'bed' },
      { model: models.Doctor, as: 'doctor' },
    ],
  },
];

export class BillingService {
  getModels() {
    return getSequelize().models;
  }

  async createBill(data) {
    const models = this.getModels();

    const patient = await models.Patient.findByPk(data.patientId);
    if (!patient) throw ApiError.notFound('Patient not found.');
    if (data.admissionId) {
      const admission = await models.Admission.findByPk(data.admissionId);
      if (!admission) throw ApiError.notFound('Admission not found.');
      if (admission.patientId !== patient.id) {
        throw ApiError.badRequest('Admission does not belong to the selected patient.');
      }
    }

    const fields = {};
    for (const field of FEE_FIELDS) fields[field] = Number(data[field] || 0);

    const totalAmount = computeTotals(fields);
    const amountPaid = Number(data.amountPaid || 0);
    const balance = round2(totalAmount - amountPaid);
    const status = deriveStatus(totalAmount, amountPaid, data.status);

    return models.Bill.create({
      patientId: patient.id,
      admissionId: data.admissionId || null,
      ...fields,
      totalAmount,
      amountPaid,
      balance,
      status,
    });
  }

  async updateBill(id, data) {
    const models = this.getModels();
    const bill = await models.Bill.findByPk(id);
    if (!bill) throw ApiError.notFound('Bill not found.');

    const fields = {};
    for (const field of FEE_FIELDS) {
      fields[field] = data[field] !== undefined ? Number(data[field]) : Number(bill[field]);
    }

    const totalAmount = computeTotals(fields);
    const amountPaid = data.amountPaid !== undefined ? Number(data.amountPaid) : Number(bill.amountPaid);
    const balance = round2(totalAmount - amountPaid);
    const status = data.status || deriveStatus(totalAmount, amountPaid, bill.status);

    await bill.update({
      ...fields,
      totalAmount,
      amountPaid,
      balance,
      status,
    });

    return bill;
  }

  async recordPayment(id, amount) {
    const sequelize = getSequelize();
    const models = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      const bill = await models.Bill.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!bill) throw ApiError.notFound('Bill not found.');
      if (bill.status === 'cancelled') {
        throw ApiError.conflict('Cancelled bills cannot receive payments.');
      }

      const newPaid = round2(Number(bill.amountPaid) + Number(amount));
      if (newPaid > Number(bill.totalAmount) + 0.009) {
        throw ApiError.conflict('Payment amount exceeds the outstanding balance.');
      }

      const balance = round2(Number(bill.totalAmount) - newPaid);
      const status = deriveStatus(Number(bill.totalAmount), newPaid, bill.status);

      await bill.update({ amountPaid: newPaid, balance, status }, { transaction });
      return bill;
    });
  }

  async getAllBills(query = {}, scopePatientId = null) {
    const models = this.getModels();
    const { page, limit, offset } = parsePagination(query);
    const where = {};

    if (scopePatientId) where.patientId = scopePatientId;
    if (query.status) where.status = query.status;
    if (query.patientId) where.patientId = query.patientId;
    if (query.admissionId) where.admissionId = query.admissionId;

    const { rows, count } = await models.Bill.findAndCountAll({
      where,
      include: billIncludes(models),
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return { data: rows, pagination: buildPagination(page, limit, count) };
  }

  async getBillById(id, scopePatientId = null) {
    const models = this.getModels();
    const bill = await models.Bill.findByPk(id, { include: billIncludes(models) });
    if (!bill) throw ApiError.notFound('Bill not found.');
    if (scopePatientId && bill.patientId !== scopePatientId) {
      throw ApiError.notFound('Bill not found.');
    }
    return bill;
  }

  async deleteBill(id) {
    const models = this.getModels();
    const bill = await models.Bill.findByPk(id);
    if (!bill) throw ApiError.notFound('Bill not found.');
    await bill.destroy();
    return bill;
  }

  async getOutstandingTotal() {
    const models = this.getModels();
    const result = await models.Bill.findAll({
      where: { status: { [Op.in]: ['pending', 'partially-paid'] } },
      attributes: [[getSequelize().fn('SUM', getSequelize().col('balance')), 'outstanding']],
      raw: true,
    });
    return round2(result[0]?.outstanding || 0);
  }
}

export default new BillingService();
