import express from 'express';
import commentRouter from './comment.js';
import { authorize } from '../middlewares/authorize.js';
import { findPublicationById } from '../middlewares/findById.js';
import { handlePublicationUpload } from '../controllers/upload.js';
import {
    getPublications,
    getPublication,
    createPublication,
    deletePublication,
} from '../controllers/publication.js';

const router = express.Router();

router.get('/', getPublications);
router.get('/:id', findPublicationById, getPublication);
router.post('/', handlePublicationUpload, createPublication);
router.delete(
    '/:id',
    authorize('admin'),
    findPublicationById,
    deletePublication
); // Only admins can delete publications. Since once the publication is created the only reason to delete is for moderation purposes.

router.use('/:id/comments', commentRouter);

export default router;
