import { z } from 'zod';

export const createImageSchema = z
  .object({
    entityType: z.enum(['product', 'doctor', 'user', 'department', 'ward', 'article']),
    entityId: z.string().uuid('Invalid entity id'),
    dataUrl: z.string().min(20).regex(/^data:image\//, 'Image must be a data URL (data:image/...)'),
    filename: z.string().trim().max(255).optional(),
  })
  .strict();

export default { createImageSchema };