import Friend from '../models/friend.js';
import { asyncHandler } from '../utils/wrapper.js';
import { notifyUsers } from '../services/websocket/websocketServer.js';

export const getFriends = asyncHandler(async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const status = req.query.status;

    const count = await Friend.countDocuments();
    const totalPages = Math.ceil(count / pageSize);

    res.set('Pagination-Page', page);
    res.set('Pagination-PageSize', pageSize);
    res.set('Pagination-Total', totalPages);

    let friends;

    if (!status) {
        friends = await Friend.find({
            $or: [
                { users: req.currentUserId, status: 'accepted' },
                {
                    users: req.currentUserId,
                    status: 'pending',
                    requester: { $ne: req.currentUserId },
                },
            ],
        })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('users');
    } else {
        // return friendship of the current user with the specified status
        friends = await Friend.find({
            users: req.currentUserId,
            status,
        })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('users');
    }

    res.json(friends);
});

export const createFriend = asyncHandler(async (req, res) => {
    try {
        const friend = await Friend.addFriend(
            req.currentUserId,
            req.body.friendId
        );
        res.status(201).json(friend);
    } catch (error) {
        if (error.message === 'The friendship already exists') {
            return res.status(400).send('The friendship already exists');
        }
        if (error.name === 'ValidationError') {
            return res.status(400).send(error.message);
        }
        res.status(500).send('Server error');
    }
});

export const deleteFriend = asyncHandler(async (req, res) => {
    const friendship = await Friend.findById(req.params.friendshipId);

    if (!friendship) {
        return res.status(404).send('Friend not found.');
    }

    await friendship.deleteOne();
    res.status(204).end();
});

export const updateFriendStatus = asyncHandler(async (req, res) => {
    const friendship = await Friend.findOne({
        _id: req.params.friendshipId,
        status: 'pending',
    });

    if (!friendship) {
        return res.status(404).send('Friend request not found.');
    }

    if (req.body.status === 'denied') {
        await friendship.deleteOne();
        return res.status(204).end();
    }

    if (req.body.status === 'accepted') {
        friendship.status = 'accepted';
        await friendship.save();

        notifyUsers([friendship.requester._id.toString()], {
            type: 'friendRequestUpdate',
            data: {
                friendshipId: friendship._id,
                status: 'accepted',
                user: {
                    _id: req.currentUserId,
                },
            },
        });

        return res.status(200).json(friendship);
    }

    res.status(400).send('Invalid status');
});
