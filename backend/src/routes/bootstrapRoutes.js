import { Router } from 'express';
import { bootstrap } from '../controllers/bootstrapController.js';

const router = Router();

router.get('/', bootstrap);

export default router;