import { z } from 'zod';

const status = z.enum(['waiting', 'in_room', 'completed', 'cancelled']);

export const createCheckinSchema = z
  .object({
    patientId: z.string().uuid('Invalid patient id'),
    doctorId: z.string().uuid('Invalid doctor id').optional(),
    reason: z.string().trim().min(1).max(500).optional(),
    room: z.string().trim().max(50).optional(),
  })
  .strict();

export const updateCheckinSchema = z
  .object({
    status: status.optional(),
    doctorId: z.string().uuid('Invalid doctor id').optional(),
    reason: z.string().trim().max(500).optional(),
    room: z.string().trim().max(50).optional(),
    vitals: z.object({
      bp: z.string().optional(),
      hr: z.number().optional(),
      temp: z.number().optional(),
      spo2: z.number().optional(),
      weight: z.number().optional(),
    }).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export default { createCheckinSchema, updateCheckinSchema };