import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Invalid email format').max(255);
const password = z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must not exceed 128 characters');
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-()]{5,20}$/, 'Invalid phone number format')
  .optional();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD');

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120).optional(),
    firstName: z.string().trim().min(1, 'First name is required').max(60).optional(),
    lastName: z.string().trim().min(1, 'Last name is required').max(60).optional(),
    email,
    password,
    phone,
    dateOfBirth: isoDate.optional().nullable(),
    role: z.enum(['patient']).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.name && !(data.firstName && data.lastName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'Provide a full name, or first and last name.',
      });
    }
  });

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, 'Password is required').max(128),
  })
  .strict();

const ROLES = [
  'admin',
  'doctor',
  'nurse',
  'receptionist',
  'pharmacist',
  'laboratory_staff',
  'accountant',
  'patient',
];

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
    email,
    password,
    phone,
    role: z.enum(ROLES),
    departmentId: z.string().uuid('Invalid department ID').nullish(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: email.optional(),
    password: password.optional(),
    phone: phone,
    role: z.enum(ROLES).optional(),
    departmentId: z.string().uuid('Invalid department ID').nullish(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export const demoSchema = z
  .object({
    role: z.string().trim().min(1).optional(),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(10).max(512),
    password,
  })
  .strict();

export const stepUpRequestSchema = z
  .object({
    purpose: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

export const stepUpVerifySchema = z
  .object({
    purpose: z.string().trim().min(1).max(50).optional(),
    code: z.string().regex(/^\d{6}$/, 'Verification code must be 6 digits'),
  })
  .strict();

export default {
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  demoSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  stepUpRequestSchema,
  stepUpVerifySchema,
};
