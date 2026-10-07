import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

const bedIncludes = (models) => [
  {
    model: models.Ward,
    as: 'ward',
    include: [{ model: models.Department, as: 'department' }],
  },
];

const generateBedNumber = (existing) => {
  for (let i = 1; i <= 999; i += 1) {
    const candidate = String(i).padStart(3, '0');
    if (!existing.includes(candidate)) return candidate;
  }
  return null;
};

export const listBeds = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 50 });
    const where = {};

    if (req.query.wardId) where.wardId = req.query.wardId;
    if (req.query.status) where.status = req.query.status;
    if (req.query.search) where.bedNumber = { [Op.iLike]: `%${req.query.search}%` };

    const { rows, count } = await models.Bed.findAndCountAll({
      where,
      include: bedIncludes(models),
      order: [
        ['bedNumber', 'ASC'],
        ['createdAt', 'ASC'],
      ],
      limit,
      offset,
      distinct: true,
    });

    return listResponse(res, rows, buildPagination(page, limit, count));
  } catch (error) {
    return next(error);
  }
};

export const getBed = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const bed = await models.Bed.findByPk(req.params.id, { include: bedIncludes(models) });
    if (!bed) throw ApiError.notFound('Bed not found.');
    return successResponse(res, bed);
  } catch (error) {
    return next(error);
  }
};

export const createBed = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const ward = await models.Ward.findByPk(req.body.wardId);
    if (!ward) throw ApiError.notFound('Ward not found.');

    let bedNumber = req.body.bedNumber;
    if (!bedNumber) {
      const existing = await models.Bed.findAll({
        where: { wardId: ward.id },
        attributes: ['bedNumber'],
      });
      bedNumber = generateBedNumber(existing.map((bed) => bed.bedNumber));
      if (!bedNumber) throw ApiError.conflict('No bed numbers available in this ward.');
    }

    const bed = await models.Bed.create({
      wardId: ward.id,
      bedNumber,
      status: req.body.status || 'available',
    });

    const created = await models.Bed.findByPk(bed.id, { include: bedIncludes(models) });
    return createdResponse(res, created, 'Bed created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateBed = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const bed = await models.Bed.findByPk(req.params.id);
    if (!bed) throw ApiError.notFound('Bed not found.');

    const patch = {};
    if (req.body.status) patch.status = req.body.status;
    if (req.body.bedNumber) patch.bedNumber = req.body.bedNumber;

    if (bed.status === 'occupied' && patch.status && patch.status !== 'occupied') {
      const activeAdmission = await models.Admission.findOne({
        where: { bedId: bed.id, status: { [Op.in]: ['admitted', 'transferred'] } },
      });
      if (activeAdmission) {
        throw ApiError.conflict('Bed is occupied by an active admission. Discharge the patient first.');
      }
    }

    await bed.update(patch);
    const updated = await models.Bed.findByPk(bed.id, { include: bedIncludes(models) });
    return successResponse(res, updated, 'Bed updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteBed = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const bed = await models.Bed.findByPk(req.params.id);
    if (!bed) throw ApiError.notFound('Bed not found.');
    await bed.destroy();
    return successResponse(res, null, 'Bed deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
