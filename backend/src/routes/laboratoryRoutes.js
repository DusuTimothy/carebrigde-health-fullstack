import { Router } from 'express';
import {
  listLaboratoryTests,
  getLaboratoryTest,
  createLaboratoryTest,
  updateLaboratoryTest,
  deleteLaboratoryTest,
} from '../controllers/laboratoryController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createLaboratoryTestSchema,
  updateLaboratoryTestSchema,
} from '../validators/clinicalValidator.js';

const router = Router();

router.get('/', listLaboratoryTests);
router.get('/:id', getLaboratoryTest);
router.post(
  '/',
  authorizeRoles('admin', 'doctor', 'nurse'),
  validate(createLaboratoryTestSchema),
  createLaboratoryTest
);
router.put(
  '/:id',
  authorizeRoles('admin', 'doctor', 'nurse', 'laboratory_staff'),
  validate(updateLaboratoryTestSchema),
  updateLaboratoryTest
);
router.delete('/:id', authorizeRoles('admin'), deleteLaboratoryTest);

export default router;
