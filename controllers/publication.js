import Publication from '../models/publication.js';
import Friend from '../models/friend.js';
import { asyncHandler } from '../utils/wrapper.js';
import { notifyUsers } from '../services/websocket/websocketServer.js';

export const getPublications = asyncHandler(async (req, res, next) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const userId = req.query.userId || null;

    if (req.respondWith && req.respondWith === 'feed')
        return getPublicationsFeed(req, res, next);

    const [publications, count] = await Promise.all([
        Publication.find({
            ...(userId && { user: userId }),
        })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('user', 'name profilePicture.url'),
        Publication.countDocuments({
            ...(userId && { user: userId }),
        }),
    ]);

    const totalPages = Math.ceil(count / pageSize);

    res.set('Pagination-Page', page);
    res.set('Pagination-Pages-Size', pageSize);
    res.set('Pagination-Total', totalPages);
    res.set('Pagination-Total-Count', count);

    res.json(publications);
});

const getPublicationsFeed = asyncHandler(async (req, res, next) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;

    const userId = req.currentUserId;

    const friendsId = await Friend.find({
        users: userId,
        status: 'accepted',
    }).distinct('users');

    const [publications, count] = await Promise.all([
        Publication.find({
            user: { $in: friendsId },
        })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('user', 'name profilePicture.url'),
        Publication.countDocuments({
            user: { $in: friendsId },
        }),
    ]);

    const totalPages = Math.ceil(count / pageSize);

    res.set('Pagination-Page', page);
    res.set('Pagination-Pages-Size', pageSize);
    res.set('Pagination-Total', totalPages);
    res.set('Pagination-Total-Count', count);

    res.json(publications);
});

export const getPublication = asyncHandler(async (req, res, next) => {
    res.json(req.publication);
});

export const createPublication = asyncHandler(async (req, res, next) => {
    if (!req.files['frontCamera'] || !req.files['backCamera']) {
        return res.status(400).json({ message: 'Images are required.' });
    }

    if (!req.body.lat || !req.body.lng) {
        return res.status(400).json({ message: 'Location is required.' });
    }

    const location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    };

    const publication = new Publication();

    publication.frontCamera = {
        url: req.images.frontCamera.url,
        id: req.images.frontCamera.upload_repsonse.public_id,
    };
    publication.backCamera = {
        url: req.images.backCamera.url,
        id: req.images.backCamera.upload_repsonse.public_id,
    };

    publication.location = location;

    publication.user = req.currentUserId;

    try {
        await publication.save();
    } catch (error) {
        return res.status(422).json({ message: error.message });
    }

    const friends = await Friend.find({
        users: req.currentUserId,
        status: 'accepted',
    });

    const friendIds = friends
        .map((friend) =>
            friend.users.find((user) => user.toString() !== req.currentUserId)
        )
        .map((friend) => friend.toString());

    notifyUsers(friendIds, {
        type: 'publicationCreated',
        publication: publication._id,
        user: {
            _id: req.currentUserId,
        },
    });

    res.status(201).json(publication);
});

export const deletePublication = asyncHandler(async (req, res, next) => {
    const result = await req.publication.deleteOne();
    if (result.deletedCount === 0) return res.status(500).end();
    res.status(204).end();
});

export const deleteUsersPublications = asyncHandler(async (req, res, next) => {
    const publications = await Publication.find({ user: req.currentUserId });
    for (const publication of publications) {
        await publication.deleteOne();
    }
    res.status(204).end();
});
