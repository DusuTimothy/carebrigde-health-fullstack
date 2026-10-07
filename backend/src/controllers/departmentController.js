import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

export const listDepartments = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;

    const { rows, count } = await models.Department.findAndCountAll({
      where,
      include: [
        { model: models.Doctor, as: 'doctors', attributes: ['id', 'firstName', 'lastName', 'specialization'] },
        { model: models.Ward, as: 'wards', attributes: ['id', 'name', 'wardType', 'status'] },
      ],
      order: [['name', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    return listResponse(res, rows, buildPagination(page, limit, count));
  } catch (error) {
    return next(error);
  }
};

export const getDepartment = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const department = await models.Department.findByPk(req.params.id, {
      include: [
        { model: models.Doctor, as: 'doctors' },
        { model: models.Ward, as: 'wards' },
      ],
    });
    if (!department) throw ApiError.notFound('Department not found.');
    return successResponse(res, department);
  } catch (error) {
    return next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const department = await models.Department.create(req.body);
    return createdResponse(res, department, 'Department created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const department = await models.Department.findByPk(req.params.id);
    if (!department) throw ApiError.notFound('Department not found.');
    await department.update(req.body);
    return successResponse(res, department, 'Department updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const department = await models.Department.findByPk(req.params.id);
    if (!department) throw ApiError.notFound('Department not found.');
    await department.destroy();
    return successResponse(res, null, 'Department deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
