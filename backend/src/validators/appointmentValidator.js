import { z } from 'zod';

const uuid = z.string().uuid('Invalid ID format');

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD');

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Invalid time format, expected HH:MM');

export const appointmentStatusEnum = z.enum([
  'scheduled',
  'confirmed',
  'checked-in',
  'in-consultation',
  'completed',
  'cancelled',
  'no-show',
]);

export const createAppointmentSchema = z.object({
  patientId: uuid.optional(),
  doctorId: uuid,
  departmentId: uuid.optional().nullable(),
  appointmentDate: isoDate,
  appointmentTime: time,
  reason: z.string().trim().max(255).optional().nullable(),
  status: appointmentStatusEnum.optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateAppointmentSchema = z.object({
  patientId: uuid.optional(),
  doctorId: uuid.optional(),
  departmentId: uuid.optional().nullable(),
  appointmentDate: isoDate.optional(),
  appointmentTime: time.optional(),
  reason: z.string().trim().max(255).optional().nullable(),
  status: appointmentStatusEnum.optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export default {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentStatusEnum,
};
