import { Router } from 'express';
import {
  listPatients,
  getPatient,
  getMyPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createPatientSchema,
  updatePatientSchema,
} from '../validators/patientValidator.js';

const router = Router();

router.get('/', listPatients);
router.get('/me/profile', getMyPatientProfile);
router.get('/:id', getPatient);
router.post(
  '/',
  authorizeRoles('admin', 'receptionist', 'doctor', 'nurse'),
  validate(createPatientSchema),
  createPatient
);
router.put('/:id', validate(updatePatientSchema), updatePatient);
router.delete('/:id', authorizeRoles('admin'), deletePatient);

export default router;
