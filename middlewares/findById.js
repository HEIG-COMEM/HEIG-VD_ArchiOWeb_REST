import User from '../models/user.js';
import Publication from '../models/publication.js';
import Friend from '../models/friend.js';

export const findUserById = async (req, res, next) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res
            .status(400)
            .json({ message: `ID ${req.params.id} is not valid.` });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
        return res
            .status(404)
            .json({ message: `No user found with ID ${req.params.id}.` });
    }
    const isFriend = await user.isFriend(req.currentUserId);
    req.user = user;
    req.isFriend = isFriend;
    next();
};

export const findPublicationById = async (req, res, next) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res
            .status(400)
            .json({ message: `ID ${req.params.id} is not valid.` });
    }
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
        return res
            .status(404)
            .json({
                message: `No publication found with ID ${req.params.id}.`,
            });
    }
    req.publication = publication;
    next();
};

export const findFriendById = async (req, res, next) => {
    const friend_id = req.params.friendId || req.body.friendId;

    if (!friend_id)
        return res.status(400).json({ message: 'Friend ID is required' });
    if (!friend_id.match(/^[0-9a-fA-F]{24}$/))
        return res
            .status(400)
            .json({ message: `ID ${req.params.friendId} is not valid.` });
    if (friend_id === req.currentUserId)
        return res
            .status(400)
            .json({ message: 'You cannot add yourself as a friend' });

    const friend = await User.findById(friend_id);
    if (!friend) {
        return res
            .status(404)
            .json({ message: `No friend found with ID ${friend_id}.` });
    }
    req.friend = friend;
    next();
};

export const findFriendshipById = async (req, res, next) => {
    if (!req.params.friendshipId.match(/^[0-9a-fA-F]{24}$/)) {
        return res
            .status(400)
            .json({ message: `ID ${req.params.friendshipId} is not valid.` });
    }
    const friendship = await Friend.findById(req.params.friendshipId);
    if (!friendship) {
        return res
            .status(404)
            .json({
                message: `No friendship found with ID ${req.params.friendshipId}.`,
            });
    }
    if (!friendship.users.includes(req.currentUserId)) {
        return res
            .status(403)
            .json({ message: 'You are not authorized to access this' });
    }
    req.friendship = friendship;
    next();
};
