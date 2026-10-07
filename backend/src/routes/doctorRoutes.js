import { Router } from 'express';
import {
  listDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { createDoctorSchema, updateDoctorSchema } from '../validators/doctorValidator.js';

const router = Router();

router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.post('/', authorizeRoles('admin'), validate(createDoctorSchema), createDoctor);
router.put('/:id', authorizeRoles('admin'), validate(updateDoctorSchema), updateDoctor);
router.delete('/:id', authorizeRoles('admin'), deleteDoctor);

export default router;
