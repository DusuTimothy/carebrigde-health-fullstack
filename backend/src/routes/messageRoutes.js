import { Router } from 'express';
import {
  listThreads,
  getThread,
  createThread,
  sendMessage,
  markThreadRead,
} from '../controllers/messageController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createThreadSchema, sendMessageSchema } from '../validators/messageValidator.js';

const router = Router();

router.get('/', listThreads);
router.post('/', validate(createThreadSchema), createThread);
router.get('/:id', getThread);
router.post('/:threadId/messages', validate(sendMessageSchema), sendMessage);
router.put('/:threadId/read', markThreadRead);

export default router;