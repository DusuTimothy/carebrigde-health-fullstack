const IMAGE_URL_PREFIX = '/api/images/';

const parseDataUrl = (dataUrl) => {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl || '');
  if (!match) return null;
  const mime = match[1] || 'image/png';
  const isBase64 = Boolean(match[2]);
  const payload = match[3];
  if (isBase64) {
    return { mime, buffer: Buffer.from(payload, 'base64') };
  }
  return { mime, buffer: Buffer.from(payload, 'utf8') };
};

/**
 * Attaches `imageId` + `imageUrl` to each entity by fetching its primary image.
 * @param {object} models
 * @param {string} entityType one of 'product'|'doctor'|'user'|'department'|'ward'
 * @param {Array<object>} entities rows (Sequelize instances or plain objects)
 */
export const attachImages = async (models, entityType, entities) => {
  const rows = entities || [];
  if (rows.length === 0) return;
  const ids = rows.map((row) => row.id).filter(Boolean);
  if (ids.length === 0) return;

  const images = await models.Image.findAll({ where: { entityType, entityId: ids, isPrimary: true } });
  const byEntity = new Map();
  images.forEach((image) => {
    if (!byEntity.has(image.entityId)) byEntity.set(image.entityId, image);
  });

  rows.forEach((row) => {
    const image = byEntity.get(row.id);
    if (image) {
      row.imageId = image.id;
      row.imageUrl = `${IMAGE_URL_PREFIX}${image.id}`;
    } else {
      row.imageId = null;
      row.imageUrl = null;
    }
  });
};

export const attachSingleImage = async (models, entityType, entity) => {
  if (!entity) return;
  await attachImages(models, entityType, [entity]);
};

/**
 * Fetches the stored image and returns { mime, buffer } or null.
 */
export const getImagePayload = async (models, id) => {
  const image = await models.Image.findByPk(id);
  if (!image) return null;
  const parsed = parseDataUrl(image.dataUrl);
  if (!parsed) return null;
  return { mime: image.mimeType || parsed.mime, buffer: parsed.buffer };
};

export default { attachImages, attachSingleImage, getImagePayload, parseDataUrl };