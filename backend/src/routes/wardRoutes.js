import { Router } from 'express';
import {
  listWards,
  getWard,
  createWard,
  updateWard,
  deleteWard,
} from '../controllers/wardController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { createWardSchema, updateWardSchema } from '../validators/wardValidator.js';

const router = Router();

router.get('/', listWards);
router.get('/:id', getWard);
router.post('/', authorizeRoles('admin'), validate(createWardSchema), createWard);
router.put('/:id', authorizeRoles('admin'), validate(updateWardSchema), updateWard);
router.delete('/:id', authorizeRoles('admin'), deleteWard);

export default router;
