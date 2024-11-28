import express from 'express';

import { sendBeRealNotification } from '../controllers/admin.js';

const router = express.Router({ mergeParams: true });

router.post('/notifications', sendBeRealNotification);

export default router;
