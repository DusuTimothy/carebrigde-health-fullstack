import { Router } from 'express';
import {
  listBills,
  getBill,
  createBill,
  updateBill,
  recordPayment,
  deleteBill,
} from '../controllers/billingController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createBillSchema,
  updateBillSchema,
  recordPaymentSchema,
} from '../validators/billingValidator.js';

const router = Router();

const BILLING_ROLES = ['admin', 'accountant', 'receptionist'];

router.get('/', listBills);
router.get('/:id', getBill);
router.post('/', authorizeRoles(...BILLING_ROLES), validate(createBillSchema), createBill);
router.put('/:id', authorizeRoles(...BILLING_ROLES), validate(updateBillSchema), updateBill);
router.post(
  '/:id/payments',
  validate(recordPaymentSchema),
  recordPayment
);
router.delete('/:id', authorizeRoles('admin', 'accountant'), deleteBill);

export default router;
