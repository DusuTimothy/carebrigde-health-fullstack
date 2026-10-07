import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { validate, validateQuery } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/productValidator.js';

const router = Router();

router.get('/', validateQuery(productQuerySchema), listProducts);
router.get('/:id', getProduct);
router.post('/', authorizeRoles('admin', 'pharmacist'), validate(createProductSchema), createProduct);
router.put('/:id', authorizeRoles('admin', 'pharmacist'), validate(updateProductSchema), updateProduct);
router.delete('/:id', authorizeRoles('admin'), deleteProduct);

export default router;
