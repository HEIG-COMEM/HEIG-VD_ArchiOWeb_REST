import express from 'express';
import commentRouter from './comment.js';
import { authorize } from '../middlewares/authorize.js';
import { findPublicationById } from '../middlewares/findById.js';
import { loadPublicationImages } from '../controllers/upload.js';
import {
    getPublications,
    getPublication,
    createPublication,
    deletePublication,
} from '../controllers/publication.js';
import * as cdn from '../middlewares/cdn.js';
import { feed, checkLastPublication } from '../middlewares/feed.js';

const router = express.Router();

router.get('/', feed, getPublications);
router.get('/:id', findPublicationById, getPublication);
router.post(
    '/',
    checkLastPublication,
    loadPublicationImages,
    cdn.uploadPublicationImages,
    createPublication
);
// Only admins can delete publications. Since once the publication is created the only reason to delete is for moderation purposes.
router.delete(
    '/:id',
    authorize('admin'),
    findPublicationById,
    deletePublication
);

router.use('/:id/comments', findPublicationById, commentRouter);

export default router;
