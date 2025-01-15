import express from 'express';

import {
    sendBeRealNotification,
    getNotification,
} from '../controllers/admin.js';

const router = express.Router({ mergeParams: true });

router.get('/notifications', getNotification);
router.post('/notifications', sendBeRealNotification);

export default router;
