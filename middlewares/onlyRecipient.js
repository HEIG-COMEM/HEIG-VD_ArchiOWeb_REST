import Friend from '../models/friend.js';

export const onlyRecipient = async (req, res, next) => {
    if (!req.params.friendshipId)
        return res.status(400).json({ message: 'Friend ID is required' });
    if (!req.params.friendshipId.match(/^[0-9a-fA-F]{24}$/))
        return res
            .status(400)
            .json({ message: `ID ${req.params.friendshipId} is not valid.` });
    const friendship = await Friend.findById(req.params.friendshipId);

    if (!friendship) {
        return res.status(404).json({ message: 'Friend request not found.' });
    }

    const recipientId = friendship.users.find(
        (userId) => userId.toString() !== friendship.requester.toString()
    );

    if (req.currentUserId !== recipientId.toString()) {
        return res
            .status(403)
            .json({
                message: 'You are not authorized to perform this action.',
            });
    }

    next();
};
