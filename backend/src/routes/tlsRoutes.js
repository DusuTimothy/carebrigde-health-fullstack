import { Router } from 'express';
import { getCaCert, getConfig, upsertConfig, regenerate, deleteConfig } from '../controllers/tlsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { upsertTlsSchema } from '../validators/tlsValidator.js';

const router = Router();

router.get('/ca', getCaCert);
router.get('/', authenticate, authorizeRoles('admin'), getConfig);
router.put('/', authenticate, authorizeRoles('admin'), validate(upsertTlsSchema), upsertConfig);
router.post('/generate', authenticate, authorizeRoles('admin'), regenerate);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteConfig);

export default router;