import Friend from '../models/friend.js';
import { asyncHandler } from '../utils/wrapper.js';
import { notifyUsers } from '../services/websocket/websocketServer.js';

export const getFriends = asyncHandler(async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const status = req.query.status;

    const query = {
        users: req.currentUserId,
    };

    if (status) {
        query.status = status;
        if (status === 'pending') {
            query.requester = { $ne: req.currentUserId };
        }
    } else {
        query.$or = [
            { status: 'accepted' },
            { status: 'pending', requester: { $ne: req.currentUserId } },
        ];
    }

    const [friends, count] = await Promise.all([
        Friend.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('users'),
        Friend.countDocuments(query),
    ]);

    const friendsMap = friends.map((friendship) => {
        const friend = friendship.users.find(
            (user) => user._id.toString() !== req.currentUserId
        );
        return {
            ...friendship.toJSON(),
            friend,
        };
    });

    const totalPages = Math.ceil(count / pageSize);

    res.set('Pagination-Page', page);
    res.set('Pagination-Page-Size', pageSize);
    res.set('Pagination-Total-Pages', totalPages);
    res.set('Pagination-Total-Count', count);

    res.json(friendsMap);
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
