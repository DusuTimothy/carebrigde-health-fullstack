import { Router } from 'express';
import { listAuditLogs, createAuditLog } from '../controllers/auditLogController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createAuditLogSchema } from '../validators/auditLogValidator.js';

const router = Router();

router.get('/', listAuditLogs);
router.post('/', validate(createAuditLogSchema), createAuditLog);

export default router;