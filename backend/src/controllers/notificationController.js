import { getSequelize } from '../config/database.js';
import { successResponse, listResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await getSequelize().models.Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 200,
    });
    return listResponse(res, notifications);
  } catch (error) {
    return next(error);
  }
};

export const notifyParticipantIds = async (models, userIds, payload) => {
  if (!userIds.length) return;
  await models.Notification.bulkCreate(
    userIds.map((userId) => ({ userId, ...payload }))
  );
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await getSequelize().models.Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) throw ApiError.notFound('Notification not found.');
    notification.read = true;
    await notification.save();
    return successResponse(res, notification, 'Notification marked as read.');
  } catch (error) {
    return next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await getSequelize().models.Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    );
    return successResponse(res, null, 'All notifications marked as read.');
  } catch (error) {
    return next(error);
  }
};