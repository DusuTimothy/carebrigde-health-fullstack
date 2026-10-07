import { z } from 'zod';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD')
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Invalid calendar date');

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-()]{5,20}$/, 'Invalid phone number format');

const bloodGroup = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'not_specified']);
const gender = z.enum(['male', 'female', 'other', 'not_specified']);

export const createPatientSchema = z.object({
  userId: z.string().uuid('Invalid user ID format').optional().nullable(),
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(100),
  dateOfBirth: isoDate.optional().nullable(),
  gender: gender.optional().nullable(),
  phone: phone.optional().nullable(),
  email: z.string().trim().toLowerCase().email('Invalid email format').max(255).optional().nullable(),
  address: z.string().max(2000).optional().nullable(),
  bloodGroup: bloodGroup.optional().nullable(),
  allergies: z.string().max(2000).optional().nullable(),
  emergencyContactName: z.string().trim().max(100).optional().nullable(),
  emergencyContactPhone: phone.optional().nullable(),
  insuranceProvider: z.string().trim().max(255).optional().nullable(),
  insuranceNumber: z.string().trim().max(50).optional().nullable(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const searchPatientsSchema = z.object({
  search: z.string().trim().min(1, 'Search term must not be empty').optional(),
  gender: gender.optional(),
  bloodGroup: bloodGroup.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export default {
  createPatientSchema,
  updatePatientSchema,
  searchPatientsSchema,
};
