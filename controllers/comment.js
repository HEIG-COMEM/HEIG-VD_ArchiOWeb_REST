import Comment from '../models/comment.js';
import { asyncHandler } from '../utils/wrapper.js';
import { notifyUsers } from '../services/websocket/websocketServer.js';

export const getComments = asyncHandler(async (req, res, next) => {
    const comments = await Comment.find({ publication: req.publication._id })
        .populate('user')
        .populate('parentComment');

    res.json(comments);
});

export const getComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findOne({
        _id: req.params.commentId,
        publication: req.publication._id,
    }).populate('user');

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    res.json(comment);
});

export const createComment = asyncHandler(async (req, res, next) => {
    const { content, parentComment } = req.body;

    if (!content)
        return res.status(422).json({ message: 'Content is required' });
    if (parentComment) {
        const parentCommentExists = await Comment.findById(parentComment);
        if (!parentCommentExists)
            return res
                .status(404)
                .json({ message: 'Parent comment not found' });
        if (
            parentCommentExists.publication.toString() !==
            req.publication._id.toString()
        )
            return res.status(422).json({
                message: 'Parent comment is not from the same publication',
            });
    }

    const comment = new Comment({
        user: req.currentUserId,
        publication: req.publication._id,
        content,
        parentComment,
    });

    await comment.save();

    const publicationCreatorId = req.publication.user._id.toString();

    const parentCommentCreatorId = parentComment
        ? (await Comment.findById(parentComment)).user.toString()
        : null;

    const userIds = [
        ...new Set(
            [publicationCreatorId, parentCommentCreatorId].filter(
                (id) => id && id !== req.currentUserId
            )
        ),
    ];

    notifyUsers(userIds, {
        type: 'commentCreated',
        data: {
            publicationId: req.publication._id,
            commentId: comment._id,
            user: {
                _id: req.currentUserId,
            },
        },
    });

    res.status(201).json(comment);
});

export const deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findOne({
        _id: req.params.commentId,
        publication: req.publication._id,
    });

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.currentUserId)
        return res.status(403).json({ message: 'Forbidden' });

    await comment.deleteOne();
    res.status(204).end();
});
