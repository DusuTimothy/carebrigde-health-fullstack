import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { createUserSchema, updateUserSchema } from '../validators/authValidator.js';

const router = Router();

router.use(authorizeRoles('admin'));

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
