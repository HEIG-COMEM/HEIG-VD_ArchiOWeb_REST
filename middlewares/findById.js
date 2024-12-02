import User from '../models/user.js';
import Publication from '../models/publication.js';

export const findUserById = async (req, res, next) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).send(`ID ${req.params.id} is not valid.`);
    }
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).send(`No user found with ID ${req.params.id}.`);
    }
    req.user = user;
    next();
};

export const findPublicationById = async (req, res, next) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).send(`ID ${req.params.id} is not valid.`);
    }
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
        return res
            .status(404)
            .send(`No publication found with ID ${req.params.id}.`);
    }
    req.publication = publication;
    next();
};

export const findFriendById = async (req, res, next) => {
    if (!req.body.friendId) {
        return res.status(400).send('Friend ID is required');
    }
    if (!req.body.friendId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).send(`ID ${req.params.friendId} is not valid.`);
    }
    if (req.body.friendId === req.currentUserId) {
        return res.status(400).send('You cannot add yourself as a friend');
    }

    const friend = await User.findById(req.body.friendId);
    if (!friend) {
        return res
            .status(404)
            .send(`No friend found with ID ${req.body.friendId}.`);
    }
    req.friend = friend;
    next();
};
