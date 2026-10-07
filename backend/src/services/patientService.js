import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { ApiError } from '../utils/errors.js';
import { parsePagination, buildPagination } from '../utils/apiResponse.js';

const PATIENT_NUMBER_ATTEMPTS = 5;

export class PatientService {
  getModels() {
    return getSequelize().models;
  }

  async createPatient(data) {
    const models = this.getModels();
    let lastError = null;

    for (let attempt = 0; attempt < PATIENT_NUMBER_ATTEMPTS; attempt += 1) {
      try {
        return await models.Patient.create(data);
      } catch (error) {
        if (error.name !== 'SequelizeUniqueConstraintError') throw error;
        lastError = error;
        if (error.errors?.some((e) => e.path !== 'patientNumber')) throw error;
      }
    }
    throw lastError || ApiError.conflict('Unable to allocate a patient number.');
  }

  async getAllPatients(query = {}) {
    const models = this.getModels();
    const { page, limit, offset } = parsePagination(query);
    const where = {};

    if (query.search) {
      const term = `%${query.search}%`;
      where[Op.or] = [
        { firstName: { [Op.iLike]: term } },
        { lastName: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
        { patientNumber: { [Op.iLike]: term } },
        { phone: { [Op.iLike]: term } },
      ];
    }
    if (query.gender) where.gender = query.gender;
    if (query.bloodGroup) where.bloodGroup = query.bloodGroup;

    const { rows, count } = await models.Patient.findAndCountAll({
      where,
      include: [{ model: models.User, as: 'user' }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return { data: rows, pagination: buildPagination(page, limit, count) };
  }

  async getPatientById(id) {
    const models = this.getModels();
    const patient = await models.Patient.findByPk(id, {
      include: [
        { model: models.User, as: 'user' },
        {
          model: models.Admission,
          as: 'admissions',
          include: [
            { model: models.Ward, as: 'ward' },
            { model: models.Bed, as: 'bed' },
            { model: models.Doctor, as: 'doctor' },
          ],
          order: [['createdAt', 'DESC']],
          limit: 5,
        },
      ],
    });
    if (!patient) throw ApiError.notFound('Patient not found.');
    return patient;
  }

  async getPatientByUserId(userId) {
    const models = this.getModels();
    return models.Patient.findOne({
      where: { userId },
      include: [{ model: models.User, as: 'user' }],
    });
  }

  async updatePatient(id, data) {
    const models = this.getModels();
    const patient = await models.Patient.findByPk(id);
    if (!patient) throw ApiError.notFound('Patient not found.');
    await patient.update(data);
    return patient.reload({ include: [{ model: models.User, as: 'user' }] });
  }

  async deletePatient(id) {
    const models = this.getModels();
    const patient = await models.Patient.findByPk(id);
    if (!patient) throw ApiError.notFound('Patient not found.');
    await patient.destroy();
    return patient;
  }
}

export default new PatientService();
