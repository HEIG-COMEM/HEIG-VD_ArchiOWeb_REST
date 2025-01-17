import User from '../models/user.js';
import Notification from '../models/notification.js';
import Publication from '../models/publication.js';

export const feed = async (req, res, next) => {
    const user = await User.findById(req.currentUserId);

    if (!user) return res.status(401).json({ message: 'User not found' });

    // Admin bypasses the middleware
    if (user.role === 'admin') return next();

    const requestedUserId = req.query.userId || null;
    const onlyLast =
        (req.query.onlyLast && req.query.onlyLast === 'true') || false;

    // If the requested user is not the current user, check if they are friends
    if (requestedUserId) {
        // If the requested user is the current user, allow the request
        if (requestedUserId === req.currentUserId) return next();

        const isFriend = await user.isFriend(requestedUserId);

        if (isFriend < 1)
            return res
                .status(403)
                .json({ message: 'You are not authorized to view this feed' });

        return next();
    }

    // If the requested user is the current user, and only the last publication is requested, allow the request
    if (onlyLast) return next();

    // Otherwise, set the response to be the feed
    req.respondWith = 'feed';
    next();
};

export const checkLastPublication = async (req, res, next) => {
    if (req.currentUserPermissions.includes('admin')) return next(); // Admin bypasses the middleware

    const lastNotification = (
        await Notification.find().sort({ createdAt: -1 }).limit(1)
    ).at(0);
    const lastPublication = (
        await Publication.find({ user: req.currentUserId })
            .sort({ createdAt: -1 })
            .limit(1)
    ).at(0);

    // If there are no notifications or publications, allow the request
    if (!lastNotification || !lastPublication) return next();

    // If the user has already published after the last notif he must wait for the next one
    if (
        new Date(lastPublication.createdAt) > new Date(lastNotification.sentAt)
    ) {
        return res.status(403).json({
            message: 'You must wait for the next publication to be notified',
        });
    }

    next();
};
