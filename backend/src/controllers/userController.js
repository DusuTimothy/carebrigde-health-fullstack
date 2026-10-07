import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse } from '../utils/apiResponse.js';
import { parsePagination, buildPagination } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

const USER_ROLES = [
  'admin',
  'doctor',
  'nurse',
  'receptionist',
  'pharmacist',
  'laboratory_staff',
  'accountant',
  'patient',
];

export const listUsers = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};

    if (req.query.search) {
      const term = `%${req.query.search}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
      ];
    }
    if (req.query.role && USER_ROLES.includes(req.query.role)) where.role = req.query.role;

    const { rows, count } = await models.User.findAndCountAll({
      where,
      include: [{ model: models.Department, as: 'department', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return listResponse(res, rows, buildPagination(page, limit, count));
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const user = await models.User.findByPk(req.params.id, {
      include: [
        { model: models.Patient, as: 'patientProfile' },
        { model: models.Doctor, as: 'doctorProfile' },
      ],
    });
    if (!user) throw ApiError.notFound('User not found.');
    return successResponse(res, user);
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const existing = await models.User.findOne({ where: { email: req.body.email } });
    if (existing) throw ApiError.conflict('An account with this email already exists.');

    if (req.body.departmentId) {
      const department = await models.Department.findByPk(req.body.departmentId);
      if (!department) throw ApiError.notFound('Department not found.');
    }

    const user = await models.User.create(req.body);
    return createdResponse(res, user, 'User created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const user = await models.User.findByPk(req.params.id);
    if (!user) throw ApiError.notFound('User not found.');

    if (req.body.email && req.body.email !== user.email) {
      const existing = await models.User.findOne({ where: { email: req.body.email } });
      if (existing) throw ApiError.conflict('An account with this email already exists.');
    }

    if (req.body.departmentId) {
      const department = await models.Department.findByPk(req.body.departmentId);
      if (!department) throw ApiError.notFound('Department not found.');
    }

    await user.update(req.body);
    const updated = await models.User.findByPk(user.id, {
      include: [{ model: models.Department, as: 'department', attributes: ['id', 'name'] }],
    });
    return successResponse(res, updated, 'User updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    if (req.params.id === req.user.id) {
      throw ApiError.badRequest('You cannot delete your own account.');
    }
    const user = await models.User.findByPk(req.params.id);
    if (!user) throw ApiError.notFound('User not found.');
    await user.destroy();
    return successResponse(res, null, 'User deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
