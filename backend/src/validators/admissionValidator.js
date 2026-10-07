import { z } from 'zod';

const uuid = z.string().uuid('Invalid ID format');

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD');

export const createAdmissionSchema = z.object({
  patientId: uuid,
  doctorId: uuid,
  wardId: uuid,
  bedId: uuid.optional(),
  admissionDate: isoDate.optional(),
  expectedDischargeDate: isoDate.optional().nullable(),
  reason: z.string().trim().max(255).optional().nullable(),
  diagnosis: z.string().trim().max(255).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateAdmissionSchema = z.object({
  doctorId: uuid.optional(),
  expectedDischargeDate: isoDate.optional().nullable(),
  reason: z.string().trim().max(255).optional().nullable(),
  diagnosis: z.string().trim().max(255).optional().nullable(),
  status: z.enum(['admitted', 'transferred', 'discharged', 'cancelled']).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const transferAdmissionSchema = z.object({
  wardId: uuid,
  bedId: uuid,
  reason: z.string().trim().max(255).optional().nullable(),
});

export const dischargeAdmissionSchema = z.object({
  dischargeNotes: z.string().max(2000).optional().nullable(),
  finalDiagnosis: z.string().trim().max(255).optional().nullable(),
});

export default {
  createAdmissionSchema,
  updateAdmissionSchema,
  transferAdmissionSchema,
  dischargeAdmissionSchema,
};
