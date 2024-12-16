import User from '../models/user.js';
import { asyncHandler } from '../utils/wrapper.js';
import { deleteImage } from '../controllers/cdn.js';

export const getUsers = asyncHandler(async (req, res, next) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';

    const users = await User.find({ name: { $regex: search, $options: 'i' } })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    const count = await User.countDocuments();
    const totalPages = Math.ceil(count / pageSize);

    res.set('Pagination-Page', page);
    res.set('Pagination-Pages-Size', pageSize);
    res.set('Pagination-Total', totalPages);
    res.set('Pagination-Total-Count', count);

    res.json(users);
});

export const getUser = asyncHandler(async (req, res, next) => {
    res.json(req.user);
});

export const getUserStats = asyncHandler(async (req, res, next) => {
    const stats = await User.aggregate([
        {
            $match: { _id: req.user._id },
        },
        {
            $lookup: {
                from: 'publications',
                localField: '_id',
                foreignField: 'user',
                as: 'publications',
            },
        },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'user',
                as: 'comments',
            },
        },
        {
            $lookup: {
                from: 'friends',
                let: { userId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ['$$userId', '$users'] },
                                    { $eq: ['$status', 'accepted'] },
                                ],
                            },
                        },
                    },
                ],
                as: 'friendships',
            },
        },
        {
            $project: {
                _id: 0,
                name: 1,
                email: 1,
                publications: { $size: '$publications' },
                comments: { $size: '$comments' },
                friendships: { $size: '$friendships' },
            },
        },
    ]);

    res.json(stats.at(0));
});

export const updateUser = asyncHandler(async (req, res, next) => {
    //check if all fields are passed in the request
    if (
        !req.body.name ||
        !req.body.password ||
        !req.body.email ||
        !req.body.profilePicture
    )
        return res
            .status(400)
            .send(`Fields name, password and email are required`);

    req.user.name = req.body.name;

    req.user.password = req.body.password;
    req.user.email = req.body.email;

    await editProfilePicture(req, res, next);

    try {
        await req.user.save();
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(422).json({ message: error.message });
        }
        return next(error);
    }

    res.json(req.user);
});

export const updateUserData = asyncHandler(async (req, res, next) => {
    //update user but before make field validation (it's a patch request so not all fields are required)
    if (req.body.name) {
        req.user.name = req.body.name;
    }
    if (req.body.password) {
        req.user.password = req.body.password;
    }
    if (req.body.email) {
        req.user.email = req.body.email;
    }

    await editProfilePicture(req, res, next);

    try {
        await req.user.save();
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(422).json({ message: error.message });
        }
        return next(error);
    }

    res.json(req.user);
});

export const deleteUser = asyncHandler(async (req, res, next) => {
    const result = await req.user.deleteOne();
    if (result.deletedCount === 0) return res.status(500).end();
    res.status(204).end();
});

const editProfilePicture = async (req, res, next) => {
    if (req.body.profilePicture) {
        if (req.body.profilePicture.url && req.body.profilePicture.id) {
            await deleteImage(req.user.profilePicture.id);
            req.user.profilePicture = req.body.profilePicture;
        } else if (req.body.profilePicture === 'default') {
            if (
                req.user.profilePicture.url ===
                User.schema.path('profilePicture.url').default()
            )
                return;

            await deleteImage(req.user.profilePicture.id);
            req.user.profilePicture.url = User.schema
                .path('profilePicture.url')
                .default();
            req.user.profilePicture.id = User.schema
                .path('profilePicture.id')
                .default();
        } else {
            return res.status(400).json({
                message: 'Invalid profile picture',
            });
        }
    }
};
