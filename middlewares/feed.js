import User from '../models/user.js';

export const feed = async (req, res, next) => {
    const user = await User.findById(req.currentUserId);

    if (!user) return res.status(401).json({ message: 'User not found' });

    // Admin bypasses the middleware
    if (user.role === 'admin') return next();

    const requestedUserId = req.query.userId || null;

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

    req.respondWith = 'feed';
    next();
};
