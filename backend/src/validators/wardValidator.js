import { z } from 'zod';

const uuid = z.string().uuid('Invalid ID format');

export const createWardSchema = z.object({
  name: z.string().trim().min(2, 'Ward name must be at least 2 characters').max(100),
  departmentId: uuid,
  wardType: z
    .enum(['emergency', 'medical', 'surgical', 'pediatric', 'maternity', 'private', 'icu', 'general'])
    .optional(),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1').optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),
});

export const updateWardSchema = createWardSchema.partial();

export const createBedSchema = z.object({
  wardId: uuid,
  bedNumber: z.string().trim().min(1, 'Bed number is required').max(10).optional(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
});

export const updateBedSchema = z.object({
  bedNumber: z.string().trim().min(1).max(10).optional(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
});

export default {
  createWardSchema,
  updateWardSchema,
  createBedSchema,
  updateBedSchema,
};
