import { Router } from 'express';
import {
  listMedicalRecords,
  getMedicalRecord,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '../controllers/medicalRecordController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
} from '../validators/clinicalValidator.js';

const router = Router();

router.get('/', listMedicalRecords);
router.get('/:id', getMedicalRecord);
router.post(
  '/',
  authorizeRoles('admin', 'doctor', 'nurse'),
  validate(createMedicalRecordSchema),
  createMedicalRecord
);
router.put(
  '/:id',
  authorizeRoles('admin', 'doctor', 'nurse'),
  validate(updateMedicalRecordSchema),
  updateMedicalRecord
);
router.delete('/:id', authorizeRoles('admin', 'doctor'), deleteMedicalRecord);

export default router;
