import { Router } from 'express';
import {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/departmentValidator.js';

const router = Router();

router.get('/', listDepartments);
router.get('/:id', getDepartment);
router.post('/', authorizeRoles('admin'), validate(createDepartmentSchema), createDepartment);
router.put('/:id', authorizeRoles('admin'), validate(updateDepartmentSchema), updateDepartment);
router.delete('/:id', authorizeRoles('admin'), deleteDepartment);

export default router;
