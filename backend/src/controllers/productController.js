import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse, parsePagination, buildPagination } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

const productIncludes = (models) => [
  {
    model: models.ProductCategory,
    as: 'category',
    attributes: ['id', 'name', 'status'],
  },
];

const SORT_OPTIONS = {
  price_asc: [['price', 'ASC']],
  price_desc: [['price', 'DESC']],
  name_asc: [['name', 'ASC']],
  name_desc: [['name', 'DESC']],
  newest: [['createdAt', 'DESC']],
};

const stockStatusCondition = (status) => {
  const s = getSequelize();
  if (status === 'out_of_stock') return [{ stockQuantity: 0 }];
  if (status === 'low_stock') {
    return [
      { stockQuantity: { [Op.gt]: 0 } },
      s.where(s.col('products.stockQuantity'), Op.lte, s.col('products.minimumStock')),
    ];
  }
  if (status === 'in_stock') {
    return [
      { stockQuantity: { [Op.gt]: 0 } },
      s.where(s.col('products.stockQuantity'), Op.gt, s.col('products.minimumStock')),
    ];
  }
  return [];
};

export const listProducts = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 12 });
    const where = {};

    if (req.query.search) {
      const term = `%${req.query.search}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: term } },
        { description: { [Op.iLike]: term } },
        { brand: { [Op.iLike]: term } },
      ];
    }
    if (req.query.category) where.categoryId = req.query.category;
    if (req.query.status) where.status = req.query.status;
    if (req.query.requiresPrescription) {
      where.requiresPrescription = req.query.requiresPrescription === 'true';
    }

    const conditions = [];
    if (req.query.minPrice) conditions.push({ price: { [Op.gte]: Number(req.query.minPrice) } });
    if (req.query.maxPrice) conditions.push({ price: { [Op.lte]: Number(req.query.maxPrice) } });
    if (req.query.stockStatus) conditions.push(...stockStatusCondition(req.query.stockStatus));

    if (conditions.length) {
      where[Op.and] = conditions;
    }

    const order = SORT_OPTIONS[req.query.sort] || [['createdAt', 'DESC']];

    const { rows, count } = await models.Product.findAndCountAll({
      where,
      include: productIncludes(models),
      order,
      limit,
      offset,
      distinct: true,
    });

    const data = rows.map((product) => {
      const json = product.toJSON();
      json.inventoryStatus =
        json.stockQuantity === 0
          ? 'out_of_stock'
          : json.stockQuantity <= json.minimumStock
            ? 'low_stock'
            : 'in_stock';
      json.effectivePrice = json.discountPrice != null ? json.discountPrice : json.price;
      return json;
    });

    return listResponse(res, data, buildPagination(page, limit, count));
  } catch (error) {
    return next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const product = await models.Product.findByPk(req.params.id, {
      include: productIncludes(models),
    });
    if (!product) throw ApiError.notFound('Product not found.');

    const json = product.toJSON();
    json.inventoryStatus =
      json.stockQuantity === 0
        ? 'out_of_stock'
        : json.stockQuantity <= json.minimumStock
          ? 'low_stock'
          : 'in_stock';
    json.effectivePrice = json.discountPrice != null ? json.discountPrice : json.price;

    return successResponse(res, json);
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const category = await models.ProductCategory.findByPk(req.body.categoryId);
    if (!category) throw ApiError.notFound('Product category not found.');

    const product = await models.Product.create(req.body);
    const created = await models.Product.findByPk(product.id, {
      include: productIncludes(models),
    });
    return createdResponse(res, created, 'Product created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const product = await models.Product.findByPk(req.params.id);
    if (!product) throw ApiError.notFound('Product not found.');

    if (req.body.categoryId) {
      const category = await models.ProductCategory.findByPk(req.body.categoryId);
      if (!category) throw ApiError.notFound('Product category not found.');
    }

    await product.update(req.body);
    const updated = await models.Product.findByPk(product.id, {
      include: productIncludes(models),
    });
    return successResponse(res, updated, 'Product updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const product = await models.Product.findByPk(req.params.id);
    if (!product) throw ApiError.notFound('Product not found.');
    await product.destroy();
    return successResponse(res, null, 'Product deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
