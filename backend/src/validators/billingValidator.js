import { z } from 'zod';

const uuid = z.string().uuid('Invalid ID format');

const money = z.coerce
  .number({ invalid_type_error: 'Amount must be a number' })
  .min(0, 'Amount must be non-negative')
  .max(9999999.99, 'Amount is too high');

export const createBillSchema = z.object({
  patientId: uuid,
  admissionId: uuid.optional().nullable(),
  consultationFee: money.optional(),
  bedFee: money.optional(),
  laboratoryFee: money.optional(),
  pharmacyFee: money.optional(),
  otherCharges: money.optional(),
  amountPaid: money.optional(),
  status: z.enum(['pending', 'partially-paid', 'paid', 'cancelled']).optional(),
});

export const updateBillSchema = createBillSchema
  .omit({ patientId: true, admissionId: true })
  .partial();

export const recordPaymentSchema = z.object({
  amount: money.refine((value) => value > 0, 'Payment amount must be greater than zero'),
});

export default {
  createBillSchema,
  updateBillSchema,
  recordPaymentSchema,
};
