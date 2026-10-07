import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

export const listCategories = async (req, res, next) => {
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

    const { rows, count } = await models.ProductCategory.findAndCountAll({
      where,
      include: [
        {
          model: models.Product,
          as: 'products',
          attributes: ['id', 'name', 'price', 'stockQuantity'],
          required: false,
        },
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

export const getCategory = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const category = await models.ProductCategory.findByPk(req.params.id, {
      include: [{ model: models.Product, as: 'products' }],
    });
    if (!category) throw ApiError.notFound('Product category not found.');
    return successResponse(res, category);
  } catch (error) {
    return next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const category = await models.ProductCategory.create(req.body);
    return createdResponse(res, category, 'Product category created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const category = await models.ProductCategory.findByPk(req.params.id);
    if (!category) throw ApiError.notFound('Product category not found.');
    await category.update(req.body);
    return successResponse(res, category, 'Product category updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const category = await models.ProductCategory.findByPk(req.params.id);
    if (!category) throw ApiError.notFound('Product category not found.');
    await category.destroy();
    return successResponse(res, null, 'Product category deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
