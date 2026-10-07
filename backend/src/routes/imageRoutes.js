import { Router } from 'express';
import { getImage, createImage, deleteImage } from '../controllers/imageController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { createImageSchema } from '../validators/imageValidator.js';

const router = Router();

router.get('/:id', getImage);
router.post('/', authenticate, validate(createImageSchema), createImage);
router.delete('/:id', authenticate, deleteImage);

export default router;