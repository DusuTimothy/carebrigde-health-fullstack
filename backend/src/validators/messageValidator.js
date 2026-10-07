import { z } from 'zod';

export const createThreadSchema = z
  .object({
    participantIds: z.array(z.string().uuid()).min(1),
    subject: z.string().trim().min(2).max(255),
    initialMessage: z.string().trim().min(1).max(5000).optional(),
  })
  .strict();

export const sendMessageSchema = z
  .object({
    body: z.string().trim().min(1).max(5000),
  })
  .strict();

export default { createThreadSchema, sendMessageSchema };