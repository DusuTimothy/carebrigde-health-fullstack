import { z } from 'zod';

const uuid = z.string().uuid('Invalid ID format');
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-()]{5,20}$/, 'Invalid phone number format');

export const createDoctorSchema = z.object({
  userId: uuid.optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128).optional(),
  departmentId: uuid,
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  specialization: z.string().trim().min(1, 'Specialization is required').max(100),
  licenseNumber: z.string().trim().max(100).optional().nullable(),
  phone: phone.optional().nullable(),
  email: z.string().trim().toLowerCase().email('Invalid email format').max(255),
  bio: z.string().max(2000).optional().nullable(),
  image: z.string().max(255).optional().nullable(),
  availability: z.enum(['available', 'limited', 'unavailable']).optional(),
});

export const updateDoctorSchema = createDoctorSchema
  .omit({ password: true, userId: true })
  .partial();

export default { createDoctorSchema, updateDoctorSchema };
