import { Router } from 'express';
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/contentController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { createArticleSchema, updateArticleSchema } from '../validators/contentValidator.js';

const router = Router();

router.get('/', listArticles);
router.get('/:id', getArticle);
router.post('/', authorizeRoles('admin'), validate(createArticleSchema), createArticle);
router.put('/:id', authorizeRoles('admin'), validate(updateArticleSchema), updateArticle);
router.delete('/:id', authorizeRoles('admin'), deleteArticle);

export default router;