import { Router } from 'express';
import {
  listBeds,
  getBed,
  createBed,
  updateBed,
  deleteBed,
} from '../controllers/bedController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { createBedSchema, updateBedSchema } from '../validators/wardValidator.js';

const router = Router();

router.get('/', listBeds);
router.get('/:id', getBed);
router.post('/', authorizeRoles('admin', 'nurse'), validate(createBedSchema), createBed);
router.put('/:id', authorizeRoles('admin', 'nurse'), validate(updateBedSchema), updateBed);
router.delete('/:id', authorizeRoles('admin'), deleteBed);

export default router;
