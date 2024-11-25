import Comment from '../models/comment.js';
import { asyncHandler } from '../utils/wrapper.js';

export const getComments = asyncHandler(async (req, res, next) => {
    const publicationId = req.params.id;

    const comments = await Comment.find({ publication: publicationId })
        .populate('user')
        .populate('parentComment');

    res.json(comments);
});

export const createComment = asyncHandler(async (req, res, next) => {
    const publicationId = req.params.id;
    const { content, parentComment } = req.body;

    const comment = new Comment({
        user: req.currentUserId,
        publication: publicationId,
        content,
        parentComment,
    });

    await comment.save();

    res.status(201).json(comment);
});

export const deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await comment.deleteOne();
    res.status(204).end();
});
