import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { ApiError } from '../utils/errors.js';
import { generateOrderNumber } from '../utils/generateOrderNumber.js';
import { parsePagination, buildPagination } from '../utils/apiResponse.js';

export const DELIVERY_FEE = 5.0;
export const FREE_DELIVERY_THRESHOLD = 100.0;

const orderIncludes = (models) => [
  { model: models.User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
  { model: models.Patient, as: 'patient', attributes: ['id', 'patientNumber', 'firstName', 'lastName'] },
  {
    model: models.OrderItem,
    as: 'items',
    include: [{ model: models.Product, as: 'product' }],
  },
];

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export class OrderService {
  getModels() {
    return getSequelize().models;
  }

  async createOrder({ userId, patientId = null, items, deliveryAddress = null }) {
    const sequelize = getSequelize();
    const models = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      const lines = [];
      let requiresPrescription = false;

      for (const item of items) {
        const product = await models.Product.findOne({
          where: { id: item.productId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!product || product.status !== 'active') {
          throw ApiError.notFound(`Product ${item.productId} not found or unavailable.`);
        }
        if (product.stockQuantity < item.quantity) {
          throw ApiError.conflict(`Insufficient stock for "${product.name}".`);
        }

        const unitPrice = product.discountPrice != null ? Number(product.discountPrice) : Number(product.price);
        const subtotal = round2(unitPrice * item.quantity);

        if (product.requiresPrescription) requiresPrescription = true;

        lines.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
          product,
        });
      }

      const subtotal = round2(lines.reduce((sum, line) => sum + line.subtotal, 0));
      const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
      const total = round2(subtotal + deliveryFee);

      const order = await models.Order.create(
        {
          userId,
          patientId,
          orderNumber: generateOrderNumber(),
          subtotal,
          deliveryFee,
          total,
          status: 'pending',
          deliveryAddress,
          paymentStatus: 'pending',
          prescriptionStatus: requiresPrescription ? 'pending' : 'not_required',
        },
        { transaction }
      );

      for (const line of lines) {
        await models.OrderItem.create(
          {
            orderId: order.id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            subtotal: line.subtotal,
          },
          { transaction }
        );

        await line.product.update(
          { stockQuantity: line.product.stockQuantity - line.quantity },
          { transaction }
        );
      }

      return models.Order.findByPk(order.id, {
        include: orderIncludes(models),
        transaction,
      });
    });
  }

  async verifyPrescription(orderId, decision) {
    const sequelize = getSequelize();
    const models = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      const order = await models.Order.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order) throw ApiError.notFound('Order not found.');
      if (order.prescriptionStatus !== 'pending') {
        throw ApiError.conflict(
          `Prescription for this order has already been ${order.prescriptionStatus}.`
        );
      }

      await order.update({ prescriptionStatus: decision }, { transaction });

      if (decision === 'rejected') {
        await this.restoreStock(order.id, transaction);
        await order.update({ status: 'cancelled' }, { transaction });
      }

      return models.Order.findByPk(order.id, {
        include: orderIncludes(models),
        transaction,
      });
    });
  }

  async updateOrderStatus(orderId, { status, paymentStatus }) {
    const sequelize = getSequelize();
    const models = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      const order = await models.Order.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order) throw ApiError.notFound('Order not found.');

      const advancingToProcessing = status && ['processing', 'shipped', 'delivered'].includes(status);
      if (advancingToProcessing) {
        if (order.prescriptionStatus === 'pending') {
          throw ApiError.conflict(
            'Prescription verification is required before this order can be processed.'
          );
        }
        if (order.prescriptionStatus === 'rejected') {
          throw ApiError.conflict('Order was rejected during prescription verification.');
        }
      }

      const cancelling = status === 'cancelled' && order.status !== 'cancelled';
      const patch = {};
      if (status) patch.status = status;
      if (paymentStatus) patch.paymentStatus = paymentStatus;

      await order.update(patch, { transaction });

      if (cancelling) {
        await this.restoreStock(order.id, transaction);
      }

      return models.Order.findByPk(order.id, {
        include: orderIncludes(models),
        transaction,
      });
    });
  }

  async restoreStock(orderId, transaction) {
    const models = this.getModels();
    const items = await models.OrderItem.findAll({
      where: { orderId },
      include: [{ model: models.Product, as: 'product' }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    for (const item of items) {
      if (!item.product) continue;
      await item.product.update(
        { stockQuantity: item.product.stockQuantity + item.quantity },
        { transaction }
      );
    }
  }

  async getAllOrders(query = {}, scopeUserId = null) {
    const models = this.getModels();
    const { page, limit, offset } = parsePagination(query);
    const where = {};

    if (scopeUserId) where.userId = scopeUserId;
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.prescriptionStatus) where.prescriptionStatus = query.prescriptionStatus;
    if (query.search) {
      where.orderNumber = { [Op.iLike]: `%${query.search}%` };
    }

    const { rows, count } = await models.Order.findAndCountAll({
      where,
      include: orderIncludes(models),
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return { data: rows, pagination: buildPagination(page, limit, count) };
  }

  async getOrderById(id) {
    const models = this.getModels();
    const order = await models.Order.findByPk(id, { include: orderIncludes(models) });
    if (!order) throw ApiError.notFound('Order not found.');
    return order;
  }
}

export default new OrderService();
