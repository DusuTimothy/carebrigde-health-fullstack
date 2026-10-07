import { Router } from 'express';
import { listCheckins, createCheckin, updateCheckin } from '../controllers/checkinController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createCheckinSchema, updateCheckinSchema } from '../validators/checkinValidator.js';

const router = Router();

router.get('/', listCheckins);
router.post('/', validate(createCheckinSchema), createCheckin);
router.put('/:id', validate(updateCheckinSchema), updateCheckin);

export default router;