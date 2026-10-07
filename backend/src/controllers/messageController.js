import { Op } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';

async function getMyThreads(req) {
  const models = getSequelize().models;
  const participations = await models.ThreadParticipant.findAll({
    where: { userId: req.user.id },
    attributes: ['threadId'],
  });
  if (participations.length === 0) return [];
  const threadIds = participations.map((p) => p.threadId);
  const threads = await models.Thread.findAll({
    where: { id: threadIds },
    include: [
      { model: models.User, as: 'participants', attributes: ['id', 'name', 'email', 'role', 'phone'] },
      {
        model: models.Message,
        as: 'messages',
        attributes: ['id', 'senderId', 'body', 'read', 'createdAt'],
        limit: 1,
        order: [['createdAt', 'DESC']],
      },
    ],
    order: [['lastMessageAt', 'DESC']],
  });
  return threads.map((thread) => {
    const json = thread.toJSON();
    json.unreadCount = 0;
    return json;
  });
}

export const listThreads = async (req, res, next) => {
  try {
    const threads = await getMyThreads(req);
    // compute unread counts
    if (threads.length) {
      const models = getSequelize().models;
      const ids = threads.map((t) => t.id);
      const unread = await models.Message.findAll({
        where: { threadId: ids, read: false },
        attributes: ['threadId', 'senderId'],
      });
      const counts = {};
      unread.forEach((m) => {
        if (m.senderId !== req.user.id) counts[m.threadId] = (counts[m.threadId] || 0) + 1;
      });
      threads.forEach((t) => (t.unreadCount = counts[t.id] || 0));
    }
    return listResponse(res, threads);
  } catch (error) {
    return next(error);
  }
};

const assertThreadParticipant = async (models, threadId, userId) => {
  const participant = await models.ThreadParticipant.findOne({ where: { threadId, userId } });
  if (!participant) {
    throw ApiError.forbidden('You are not part of this conversation.');
  }
};

export const getThread = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    await assertThreadParticipant(models, req.params.id, req.user.id);
    const thread = await models.Thread.findByPk(req.params.id, {
      include: [
        { model: models.User, as: 'participants', attributes: ['id', 'name', 'email', 'role', 'phone'] },
        {
          model: models.Message,
          as: 'messages',
          include: [{ model: models.User, as: 'sender', attributes: ['id', 'name', 'role'] }],
          order: [['createdAt', 'ASC']],
        },
      ],
    });
    if (!thread) throw ApiError.notFound('Conversation not found.');
    return successResponse(res, thread, 'Conversation retrieved.');
  } catch (error) {
    return next(error);
  }
};

export const createThread = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { participantIds, subject, initialMessage } = req.body;
    const participantSet = new Set([req.user.id, ...(participantIds || [])]);

    const thread = await getSequelize().transaction(async (transaction) => {
      const created = await models.Thread.create({ subject, createdBy: req.user.id }, { transaction });
      await models.ThreadParticipant.bulkCreate(
        [...participantSet].map((userId) => ({ threadId: created.id, userId })),
        { transaction }
      );
      if (initialMessage) {
        await models.Message.create(
          { threadId: created.id, senderId: req.user.id, body: initialMessage },
          { transaction }
        );
      }
      return created;
    });

    const full = await models.Thread.findByPk(thread.id, {
      include: [
        { model: models.User, as: 'participants', attributes: ['id', 'name', 'email', 'role', 'phone'] },
        {
          model: models.Message,
          as: 'messages',
          include: [{ model: models.User, as: 'sender', attributes: ['id', 'name', 'role'] }],
          order: [['createdAt', 'ASC']],
        },
      ],
    });
    return createdResponse(res, full, 'Conversation started.');
  } catch (error) {
    return next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    await assertThreadParticipant(models, req.params.threadId, req.user.id);

    const message = await getSequelize().transaction(async (transaction) => {
      const created = await models.Message.create(
        { threadId: req.params.threadId, senderId: req.user.id, body: req.body.body },
        { transaction }
      );
      await models.Thread.update(
        { lastMessageAt: new Date() },
        { where: { id: req.params.threadId }, transaction }
      );
      return created;
    });

    const full = await models.Message.findByPk(message.id, {
      include: [{ model: models.User, as: 'sender', attributes: ['id', 'name', 'role'] }],
    });

    const participants = await models.ThreadParticipant.findAll({
      where: { threadId: req.params.threadId, userId: { [Op.ne]: req.user.id } },
      attributes: ['userId'],
    });
    const recipients = participants.map((p) => p.userId);
    if (recipients.length) {
      const thread = await models.Thread.findByPk(req.params.threadId, { attributes: ['subject'] });
      await models.Notification.bulkCreate(
        recipients.map((userId) => ({
          userId,
          type: 'message',
          title: 'New message',
          body: `You have a new message in "${thread.subject}".`,
          link: `/portal/messages`,
        }))
      );
    }

    return createdResponse(res, full, 'Message sent.');
  } catch (error) {
    return next(error);
  }
};

export const markThreadRead = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    await assertThreadParticipant(models, req.params.threadId, req.user.id);
    await models.Message.update(
      { read: true },
      { where: { threadId: req.params.threadId, senderId: { [Op.ne]: req.user.id }, read: false } }
    );
    return successResponse(res, null, 'Conversation marked as read.');
  } catch (error) {
    return next(error);
  }
};