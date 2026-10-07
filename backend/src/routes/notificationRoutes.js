import { Router } from 'express';
import {
  listNotifications,
  markNotificationRead,
  markAllRead,
} from '../controllers/notificationController.js';

const router = Router();

router.get('/', listNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markNotificationRead);

export default router;