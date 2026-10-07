import { Router } from 'express';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/productCategoryController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { createCategorySchema, updateCategorySchema } from '../validators/productValidator.js';

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', authorizeRoles('admin', 'pharmacist'), validate(createCategorySchema), createCategory);
router.put(
  '/:id',
  authorizeRoles('admin', 'pharmacist'),
  validate(updateCategorySchema),
  updateCategory
);
router.delete('/:id', authorizeRoles('admin'), deleteCategory);

export default router;
