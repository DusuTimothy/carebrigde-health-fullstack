import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';
import { getImagePayload } from '../utils/images.js';

const CAN_CREATE = ['admin', 'pharmacist', 'nurse', 'receptionist'];

export const getImage = async (req, res, next) => {
  try {
    const payload = await getImagePayload(getSequelize().models, req.params.id);
    if (!payload) {
      throw ApiError.notFound('Image not found.');
    }
    res.set('Content-Type', payload.mime);
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('X-Content-Type-Options', 'nosniff');
    return res.send(payload.buffer);
  } catch (error) {
    return next(error);
  }
};

export const createImage = async (req, res, next) => {
  try {
    if (!CAN_CREATE.includes(req.user.role)) {
      throw ApiError.forbidden('You are not allowed to upload images.');
    }
    const { entityType, entityId, dataUrl, filename } = req.body;
    if (!dataUrl || !/^data:image\//.test(dataUrl)) {
      throw ApiError.badRequest('A valid base64 image data URL is required (data:image/...).');
    }
    const mime = dataUrl.match(/^data:([^;,]+)/)?.[1] || null;

    const existing = await getSequelize().models.Image.findOne({
      where: { entityType, entityId, isPrimary: true },
    });

    let image;
    if (existing) {
      existing.dataUrl = dataUrl;
      existing.mimeType = mime;
      existing.filename = filename || existing.filename;
      await existing.save();
      image = existing;
    } else {
      image = await getSequelize().models.Image.create({
        entityType,
        entityId,
        dataUrl,
        mimeType: mime,
        filename: filename || null,
        isPrimary: true,
      });
    }

    return createdResponse(res, image, 'Image stored successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const image = await getSequelize().models.Image.findByPk(req.params.id);
    if (!image) {
      throw ApiError.notFound('Image not found.');
    }
    if (!CAN_CREATE.includes(req.user.role)) {
      throw ApiError.forbidden('You are not allowed to delete images.');
    }
    await image.destroy();
    return successResponse(res, null, 'Image deleted.');
  } catch (error) {
    return next(error);
  }
};