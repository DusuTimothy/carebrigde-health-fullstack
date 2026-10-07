import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, 'Department name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional().nullable(),
  image: z.string().max(255).optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export default { createDepartmentSchema, updateDepartmentSchema };
