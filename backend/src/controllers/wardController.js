import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

const wardIncludes = (models, { withBeds = false } = {}) => {
  const includes = [{ model: models.Department, as: 'department' }];
  if (withBeds) {
    includes.push({
      model: models.Bed,
      as: 'beds',
      order: [['bedNumber', 'ASC']],
    });
  }
  return includes;
};

export const listWards = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { wardType: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;
    if (req.query.wardType) where.wardType = req.query.wardType;
    if (req.query.departmentId) where.departmentId = req.query.departmentId;

    const includes = [{ model: models.Department, as: 'department' }];
    if (req.query.withBeds === 'true') {
      includes.push({ model: models.Bed, as: 'beds', order: [['bedNumber', 'ASC']] });
    }

    const { rows, count } = await models.Ward.findAndCountAll({
      where,
      include: includes,
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

export const getWard = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const ward = await models.Ward.findByPk(req.params.id, {
      include: wardIncludes(models, { withBeds: true }),
    });
    if (!ward) throw ApiError.notFound('Ward not found.');
    return successResponse(res, ward);
  } catch (error) {
    return next(error);
  }
};

export const createWard = async (req, res, next) => {
  try {
    const sequelize = getSequelize();
    const models = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      const department = await models.Department.findByPk(req.body.departmentId, { transaction });
      if (!department) throw ApiError.notFound('Department not found.');

      const ward = await models.Ward.create(req.body, { transaction });

      const capacity = Number(req.body.capacity) || 0;
      if (capacity > 0) {
        const beds = Array.from({ length: capacity }, (_, i) => ({
          wardId: ward.id,
          bedNumber: String(i + 1).padStart(3, '0'),
          status: 'available',
        }));
        await models.Bed.bulkCreate(beds, { transaction });
      }

      const created = await models.Ward.findByPk(ward.id, {
        include: wardIncludes(models, { withBeds: true }),
        transaction,
      });
      return createdResponse(res, created, 'Ward created successfully.');
    });
  } catch (error) {
    return next(error);
  }
};

export const updateWard = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const ward = await models.Ward.findByPk(req.params.id);
    if (!ward) throw ApiError.notFound('Ward not found.');

    if (req.body.departmentId) {
      const department = await models.Department.findByPk(req.body.departmentId);
      if (!department) throw ApiError.notFound('Department not found.');
    }

    await ward.update(req.body);
    const updated = await models.Ward.findByPk(ward.id, { include: wardIncludes(models) });
    return successResponse(res, updated, 'Ward updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteWard = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const ward = await models.Ward.findByPk(req.params.id);
    if (!ward) throw ApiError.notFound('Ward not found.');
    await ward.destroy();
    return successResponse(res, null, 'Ward deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
