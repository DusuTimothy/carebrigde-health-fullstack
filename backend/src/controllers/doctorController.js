import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

const doctorIncludes = (models) => [
  { model: models.Department, as: 'department' },
  { model: models.User, as: 'user' },
];

export const listDoctors = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};

    if (req.query.search) {
      const term = `%${req.query.search}%`;
      where[Op.or] = [
        { firstName: { [Op.iLike]: term } },
        { lastName: { [Op.iLike]: term } },
        { specialization: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
      ];
    }
    if (req.query.departmentId) where.departmentId = req.query.departmentId;
    if (req.query.specialization) where.specialization = { [Op.iLike]: `%${req.query.specialization}%` };
    if (req.query.availability) where.availability = req.query.availability;

    const { rows, count } = await models.Doctor.findAndCountAll({
      where,
      include: doctorIncludes(models),
      order: [['lastName', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    return listResponse(res, rows, buildPagination(page, limit, count));
  } catch (error) {
    return next(error);
  }
};

export const getDoctor = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const doctor = await models.Doctor.findByPk(req.params.id, {
      include: [
        ...doctorIncludes(models),
        {
          model: models.Appointment,
          as: 'appointments',
          order: [['appointmentDate', 'DESC']],
          limit: 10,
        },
      ],
    });
    if (!doctor) throw ApiError.notFound('Doctor not found.');
    return successResponse(res, doctor);
  } catch (error) {
    return next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { userId, password, ...payload } = req.body;

    const department = await models.Department.findByPk(payload.departmentId);
    if (!department) throw ApiError.notFound('Department not found.');

    let linkedUserId = userId || null;

    if (!linkedUserId && password) {
      const existing = await models.User.findOne({ where: { email: payload.email } });
      if (existing) throw ApiError.conflict('An account with this email already exists.');
      const user = await models.User.create({
        name: `${payload.firstName} ${payload.lastName}`,
        email: payload.email,
        password,
        phone: payload.phone || null,
        role: 'doctor',
      });
      linkedUserId = user.id;
    }

    const doctor = await models.Doctor.create({ ...payload, userId: linkedUserId });
    const created = await models.Doctor.findByPk(doctor.id, { include: doctorIncludes(models) });
    return createdResponse(res, created, 'Doctor created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const doctor = await models.Doctor.findByPk(req.params.id);
    if (!doctor) throw ApiError.notFound('Doctor not found.');

    const payload = { ...req.body };
    delete payload.password;
    delete payload.userId;
    if (payload.departmentId) {
      const department = await models.Department.findByPk(payload.departmentId);
      if (!department) throw ApiError.notFound('Department not found.');
    }

    await doctor.update(payload);
    const updated = await models.Doctor.findByPk(doctor.id, { include: doctorIncludes(models) });
    return successResponse(res, updated, 'Doctor updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const doctor = await models.Doctor.findByPk(req.params.id);
    if (!doctor) throw ApiError.notFound('Doctor not found.');
    await doctor.destroy();
    return successResponse(res, null, 'Doctor deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
