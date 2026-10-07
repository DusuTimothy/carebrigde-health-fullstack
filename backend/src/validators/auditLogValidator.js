import { z } from 'zod';

export const createAuditLogSchema = z
  .object({
    action: z.string().trim().min(2).max(50),
    target: z.string().trim().max(255).optional(),
    detail: z.string().trim().max(2000).optional(),
  })
  .strict();

export default { createAuditLogSchema };