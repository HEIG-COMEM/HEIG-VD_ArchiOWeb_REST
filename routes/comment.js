import express from 'express';

import {
    getComments,
    createComment,
    deleteComment,
} from '../controllers/comment.js';

const router = express.Router({ mergeParams: true });

router.get('/', getComments);
router.post('/', createComment);
router.delete('/:commentId', deleteComment);

export default router;
