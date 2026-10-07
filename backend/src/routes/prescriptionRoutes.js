import { Router } from 'express';
import {
  listPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from '../controllers/prescriptionController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
} from '../validators/clinicalValidator.js';

const router = Router();

router.get('/', listPrescriptions);
router.get('/:id', getPrescription);
router.post('/', authorizeRoles('admin', 'doctor'), validate(createPrescriptionSchema), createPrescription);
router.put(
  '/:id',
  authorizeRoles('admin', 'doctor', 'pharmacist', 'nurse'),
  validate(updatePrescriptionSchema),
  updatePrescription
);
router.delete('/:id', authorizeRoles('admin', 'doctor'), deletePrescription);

export default router;
