import { Router } from 'express';
import {
  listOrders,
  getOrder,
  createOrder,
  verifyOrderPrescription,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createOrderSchema,
  verifyPrescriptionSchema,
  updateOrderStatusSchema,
} from '../validators/productValidator.js';

const router = Router();

router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/', validate(createOrderSchema), createOrder);
router.put(
  '/:id/verify-prescription',
  authorizeRoles('admin', 'pharmacist'),
  validate(verifyPrescriptionSchema),
  verifyOrderPrescription
);
router.put(
  '/:id/status',
  authorizeRoles('admin', 'pharmacist'),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
