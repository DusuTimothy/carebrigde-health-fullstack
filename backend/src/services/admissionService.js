import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { ApiError } from '../utils/errors.js';
import { parsePagination, buildPagination } from '../utils/apiResponse.js';

const ACTIVE_STATUSES = ['admitted', 'transferred'];

const admissionIncludes = (models) => [
  {
    model: models.Patient,
    as: 'patient',
    attributes: { exclude: ['userId'] },
  },
  {
    model: models.Doctor,
    as: 'doctor',
    include: [{ model: models.Department, as: 'department' }],
  },
  { model: models.Ward, as: 'ward' },
  { model: models.Bed, as: 'bed' },
];

export class AdmissionService {
  getModels() {
    return getSequelize().models;
  }

  async admitPatient(data) {
    const sequelize = getSequelize();
    const models = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      const patient = await models.Patient.findByPk(data.patientId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!patient) throw ApiError.notFound('Patient not found.');

      const doctor = await models.Doctor.findByPk(data.doctorId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!doctor) throw ApiError.notFound('Doctor not found.');

      const ward = await models.Ward.findByPk(data.wardId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!ward) throw ApiError.notFound('Ward not found.');
      if (ward.status !== 'active') {
        throw ApiError.conflict(`Ward "${ward.name}" is not active.`);
      }

      const bed = data.bedId
        ? await models.Bed.findOne({
            where: { id: data.bedId },
            transaction,
            lock: transaction.LOCK.UPDATE,
          })
        : await models.Bed.findOne({
            where: { wardId: ward.id, status: 'available' },
            order: [['bedNumber', 'ASC']],
            transaction,
            lock: transaction.LOCK.UPDATE,
          });
      if (!bed) {
        throw data.bedId
          ? ApiError.notFound('Bed not found.')
          : ApiError.conflict(`No available beds in ward "${ward.name}".`);
      }
      if (bed.wardId !== ward.id) {
        throw ApiError.badRequest('Bed does not belong to the selected ward.');
      }
      if (bed.status !== 'available') {
        throw ApiError.conflict(`Bed is currently ${bed.status} and cannot be assigned.`);
      }

      const activeAdmission = await models.Admission.findOne({
        where: {
          patientId: patient.id,
          status: { [Op.in]: ACTIVE_STATUSES },
        },
        transaction,
      });
      if (activeAdmission) {
        throw ApiError.conflict('Patient already has an active admission.');
      }

      const admission = await models.Admission.create(
        {
          patientId: patient.id,
          doctorId: doctor.id,
          wardId: ward.id,
          bedId: bed.id,
          admissionDate: data.admissionDate || new Date().toISOString().slice(0, 10),
          expectedDischargeDate: data.expectedDischargeDate || null,
          reason: data.reason || null,
          diagnosis: data.diagnosis || null,
          notes: data.notes || null,
          status: 'admitted',
        },
        { transaction }
      );

      await bed.update({ status: 'occupied' }, { transaction });

      return models.Admission.findByPk(admission.id, {
        include: admissionIncludes(models),
        transaction,
      });
    });
  }

  async transferAdmission(admissionId, data, transferredBy = null) {
    const sequelize = getSequelize();
    const models = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      const admission = await models.Admission.findByPk(admissionId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!admission) throw ApiError.notFound('Admission not found.');
      if (!ACTIVE_STATUSES.includes(admission.status)) {
        throw ApiError.conflict('Only active admissions can be transferred.');
      }

      const previousWardId = admission.wardId;
      const previousBedId = admission.bedId;

      const oldBed = await models.Bed.findOne({
        where: { id: previousBedId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const newBed = await models.Bed.findOne({
        where: { id: data.bedId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!newBed) throw ApiError.notFound('Destination bed not found.');
      if (newBed.wardId !== data.wardId) {
        throw ApiError.badRequest('Destination bed does not belong to the selected ward.');
      }
      if (oldBed && newBed.id === oldBed.id) {
        throw ApiError.badRequest('Patient is already assigned to this bed.');
      }
      if (newBed.status !== 'available') {
        throw ApiError.conflict(`Destination bed is currently ${newBed.status}.`);
      }

      if (oldBed) await oldBed.update({ status: 'available' }, { transaction });
      await newBed.update({ status: 'occupied' }, { transaction });

      await admission.update(
        {
          wardId: data.wardId,
          bedId: newBed.id,
          status: 'transferred',
        },
        { transaction }
      );

      const transfer = await models.PatientTransfer.create(
        {
          admissionId: admission.id,
          patientId: admission.patientId,
          fromWardId: previousWardId,
          fromBedId: previousBedId,
          toWardId: data.wardId,
          toBedId: newBed.id,
          reason: data.reason || null,
          transferDate: new Date().toISOString().slice(0, 10),
          transferredBy,
        },
        { transaction }
      );

      const result = await models.Admission.findByPk(admission.id, {
        include: [
          ...admissionIncludes(models),
          {
            model: models.PatientTransfer,
            as: 'transfers',
            include: [
              { model: models.Ward, as: 'fromWard' },
              { model: models.Ward, as: 'toWard' },
              { model: models.Bed, as: 'fromBed' },
              { model: models.Bed, as: 'toBed' },
            ],
          },
        ],
        transaction,
      });
      result.dataValues.lastTransfer = transfer;
      return result;
    });
  }

  async dischargeAdmission(admissionId, data) {
    const sequelize = getSequelize();
    const models = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      const admission = await models.Admission.findByPk(admissionId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!admission) throw ApiError.notFound('Admission not found.');
      if (!ACTIVE_STATUSES.includes(admission.status)) {
        throw ApiError.conflict('Admission is not active.');
      }

      const bed = await models.Bed.findOne({
        where: { id: admission.bedId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (bed && bed.status === 'occupied') {
        await bed.update({ status: 'available' }, { transaction });
      }

      await admission.update(
        {
          status: 'discharged',
          dischargeDate: new Date().toISOString().slice(0, 10),
          dischargeNotes: data.dischargeNotes ?? admission.dischargeNotes,
          finalDiagnosis: data.finalDiagnosis ?? admission.finalDiagnosis,
        },
        { transaction }
      );

      return models.Admission.findByPk(admission.id, {
        include: admissionIncludes(models),
        transaction,
      });
    });
  }

  async cancelAdmission(admissionId) {
    const sequelize = getSequelize();
    const models = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      const admission = await models.Admission.findByPk(admissionId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!admission) throw ApiError.notFound('Admission not found.');
      if (!ACTIVE_STATUSES.includes(admission.status)) {
        throw ApiError.conflict('Admission is not active.');
      }

      const bed = await models.Bed.findOne({
        where: { id: admission.bedId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (bed && bed.status === 'occupied') {
        await bed.update({ status: 'available' }, { transaction });
      }

      await admission.update({ status: 'cancelled' }, { transaction });
      return admission.reload({ include: admissionIncludes(models), transaction });
    });
  }

  async getAllAdmissions(query = {}) {
    const models = this.getModels();
    const { page, limit, offset } = parsePagination(query);
    const where = {};

    if (query.status) where.status = query.status;
    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.wardId) where.wardId = query.wardId;
    if (query.search) {
      where[Op.or] = [
        { reason: { [Op.iLike]: `%${query.search}%` } },
        { diagnosis: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { rows, count } = await models.Admission.findAndCountAll({
      where,
      include: admissionIncludes(models),
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return { data: rows, pagination: buildPagination(page, limit, count) };
  }

  async getAdmissionById(id) {
    const models = this.getModels();
    const admission = await models.Admission.findByPk(id, {
      include: [
        ...admissionIncludes(models),
        {
          model: models.PatientTransfer,
          as: 'transfers',
          include: [
            { model: models.Ward, as: 'fromWard' },
            { model: models.Ward, as: 'toWard' },
            { model: models.Bed, as: 'fromBed' },
            { model: models.Bed, as: 'toBed' },
          ],
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    if (!admission) throw ApiError.notFound('Admission not found.');
    return admission;
  }

  async updateAdmission(id, data) {
    const models = this.getModels();
    const admission = await models.Admission.findByPk(id);
    if (!admission) throw ApiError.notFound('Admission not found.');
    await admission.update(data);
    return admission.reload({ include: admissionIncludes(models) });
  }
}

export default new AdmissionService();
