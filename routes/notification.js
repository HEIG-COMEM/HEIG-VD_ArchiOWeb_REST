import express from 'express';
import { authorize } from '../middlewares/authorize.js';
import {
    sendBeRealNotification,
    getNotification,
} from '../controllers/notification.js';

const router = express.Router({ mergeParams: true });

router.get('/', getNotification);
router.post('/', authorize('admin'), sendBeRealNotification);

export default router;
