import { z } from 'zod';

const uuid = z.string().uuid('Invalid ID format');

export const createMedicalRecordSchema = z.object({
  patientId: uuid,
  doctorId: uuid.optional(),
  diagnosis: z.string().max(2000).optional().nullable(),
  symptoms: z.string().max(2000).optional().nullable(),
  treatment: z.string().max(2000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateMedicalRecordSchema = createMedicalRecordSchema
  .omit({ patientId: true })
  .partial();

export const createPrescriptionSchema = z.object({
  patientId: uuid,
  doctorId: uuid.optional(),
  medicineId: uuid.optional().nullable(),
  dosage: z.string().trim().max(100).optional().nullable(),
  frequency: z.string().trim().max(100).optional().nullable(),
  duration: z.string().trim().max(100).optional().nullable(),
  instructions: z.string().max(2000).optional().nullable(),
  status: z.enum(['pending', 'approved', 'dispensed', 'rejected']).optional(),
});

export const updatePrescriptionSchema = z.object({
  doctorId: uuid.optional(),
  medicineId: uuid.optional().nullable(),
  dosage: z.string().trim().max(100).optional().nullable(),
  frequency: z.string().trim().max(100).optional().nullable(),
  duration: z.string().trim().max(100).optional().nullable(),
  instructions: z.string().max(2000).optional().nullable(),
  status: z.enum(['pending', 'approved', 'dispensed', 'rejected']).optional(),
});

export const createLaboratoryTestSchema = z.object({
  patientId: uuid,
  doctorId: uuid.optional().nullable(),
  testName: z.string().trim().min(1, 'Test name is required').max(255),
  testType: z.string().trim().max(100).optional().nullable(),
  result: z.string().max(5000).optional().nullable(),
  status: z
    .enum(['requested', 'sample-collected', 'processing', 'completed', 'cancelled'])
    .optional(),
  requestedAt: z.string().datetime({ message: 'requestedAt must be an ISO date' }).optional(),
  completedAt: z.string().datetime({ message: 'completedAt must be an ISO date' }).optional().nullable(),
});

export const updateLaboratoryTestSchema = createLaboratoryTestSchema
  .omit({ patientId: true })
  .partial();

export default {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
  createPrescriptionSchema,
  updatePrescriptionSchema,
  createLaboratoryTestSchema,
  updateLaboratoryTestSchema,
};
