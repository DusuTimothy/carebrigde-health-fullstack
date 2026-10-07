import { Router } from 'express';
import {
  listAdmissions,
  getAdmission,
  createAdmission,
  updateAdmission,
  transferAdmission,
  dischargeAdmission,
  cancelAdmission,
  deleteAdmission,
} from '../controllers/admissionController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createAdmissionSchema,
  updateAdmissionSchema,
  transferAdmissionSchema,
  dischargeAdmissionSchema,
} from '../validators/admissionValidator.js';

const router = Router();

const STAFF = ['admin', 'receptionist', 'doctor', 'nurse'];

router.get('/', listAdmissions);
router.get('/:id', getAdmission);
router.post('/', authorizeRoles(...STAFF), validate(createAdmissionSchema), createAdmission);
router.put('/:id', authorizeRoles(...STAFF), validate(updateAdmissionSchema), updateAdmission);
router.put(
  '/:id/transfer',
  authorizeRoles(...STAFF),
  validate(transferAdmissionSchema),
  transferAdmission
);
router.put(
  '/:id/discharge',
  authorizeRoles(...STAFF),
  validate(dischargeAdmissionSchema),
  dischargeAdmission
);
router.put('/:id/cancel', authorizeRoles(...STAFF), cancelAdmission);
router.delete('/:id', authorizeRoles('admin'), deleteAdmission);

export default router;
