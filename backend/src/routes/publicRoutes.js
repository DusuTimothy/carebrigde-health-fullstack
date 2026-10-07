import { Router } from 'express';
import {
  publicSite,
  listDoctorsPublic,
  listProductsPublic,
  listWardsPublic,
  subscribeNewsletter,
  createStoryPublic,
} from '../controllers/contentController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { newsletterSchema, storySchema } from '../validators/contentValidator.js';

const router = Router();

router.get('/site', publicSite);
router.get('/doctors', listDoctorsPublic);
router.get('/products', listProductsPublic);
router.get('/wards', listWardsPublic);
router.post('/newsletter', validate(newsletterSchema), subscribeNewsletter);
router.post('/stories', validate(storySchema), createStoryPublic);

export default router;