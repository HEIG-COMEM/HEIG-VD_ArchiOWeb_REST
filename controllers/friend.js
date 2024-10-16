import Friend from '../models/friend.js';
import { asyncHandler } from "../utils/wrapper.js";

export const getFriends = asyncHandler(async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;

    const count = await Friend.countDocuments();

    res.set('Pagination-Page', page);
    res.set('Pagination-PageSize', pageSize);
    res.set('Pagination-Total', count);

    const friends = await Friend.find({ users: req.currentUserId })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate('users');

    res.json(friends);
});

export const createFriend = asyncHandler(async (req, res) => {
    const friend = await Friend.addFriend(req.currentUserId, req.body.friendId);
    res.status(201).json(friend);
});

export const deleteFriend = asyncHandler(async (req, res) => {
    await Friend.deleteOne({ users: { $all: [req.currentUserId, req.params.friendId] } });
    res.status(204).end();
});