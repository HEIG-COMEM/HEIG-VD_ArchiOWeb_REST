import Friend from '../models/friend.js';

export const onlyRecipient = async (req, res, next) => {
    const friendship = await Friend.findById(req.params.friendshipId);

    if (!friendship) {
        return res.status(404).send('Friend request not found.');
    }

    const recipientId = friendship.users.find(
        (userId) => userId.toString() !== friendship.requester.toString()
    );

    if (req.currentUserId !== recipientId.toString()) {
        return res
            .status(403)
            .send('You are not authorized to perform this action.');
    }

    next();
};
