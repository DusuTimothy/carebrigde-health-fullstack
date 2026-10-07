import { Router } from 'express';
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from '../validators/appointmentValidator.js';

const router = Router();

router.get('/', listAppointments);
router.get('/:id', getAppointment);
router.post(
  '/',
  authorizeRoles('admin', 'receptionist', 'doctor', 'patient'),
  validate(createAppointmentSchema),
  createAppointment
);
router.put(
  '/:id',
  authorizeRoles('admin', 'receptionist', 'doctor', 'patient'),
  validate(updateAppointmentSchema),
  updateAppointment
);
router.delete('/:id', authorizeRoles('admin', 'receptionist'), deleteAppointment);

export default router;
