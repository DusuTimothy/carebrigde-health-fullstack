import { Router } from 'express';
import {
  adminDashboard,
  doctorDashboard,
  nurseDashboard,
  pharmacyDashboard,
  patientDashboard,
} from '../controllers/dashboardController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/admin', authorizeRoles('admin'), adminDashboard);
router.get('/doctor', authorizeRoles('admin', 'doctor'), doctorDashboard);
router.get('/nurse', authorizeRoles('admin', 'nurse'), nurseDashboard);
router.get('/pharmacy', authorizeRoles('admin', 'pharmacist'), pharmacyDashboard);
router.get('/patient', authorizeRoles('admin', 'patient'), patientDashboard);

export default router;
