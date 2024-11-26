import User from '../models/user.js';
import { asyncHandler } from '../utils/wrapper.js';
import bcrypt from 'bcrypt';

export const getUsers = asyncHandler(async (req, res, next) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;

    const users = await User.find()
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    const count = await User.countDocuments();

    res.set('Pagination-Page', page);
    res.set('Pagination-PageSize', pageSize);
    res.set('Pagination-Total', count);

    res.json(users);
});

export const getUser = asyncHandler(async (req, res, next) => {
    res.json(req.user);
});

export const updateUser = asyncHandler(async (req, res, next) => {
    //check if all fields are passed in the request
    if (!req.body.name || !req.body.password || !req.body.email)
        return res
            .status(400)
            .send(`Fields name, password and email are required`);

    req.user.name = req.body.name;

    const plainPassword = req.body.password;
    const costFactor = 10;

    const hashedPassword = await bcrypt.hash(plainPassword, costFactor);

    req.user.password = hashedPassword;
    req.user.email = req.body.email;

    req.user.profilePictureUrl =
        req.body.profilePictureUrl ||
        User.schema.path('profilePictureUrl').defaultValue;

    await req.user.save();

    res.json(req.user);
});

export const updateUserData = asyncHandler(async (req, res, next) => {
    req.user.name = req.body.name || req.user.name;

    if (req.body.password) {
        const plainPassword = req.body.password;
        const costFactor = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, costFactor);
        req.user.password = hashedPassword;
    }

    req.user.email = req.body.email || req.user.email;
    req.user.profilePictureUrl =
        req.body.profilePictureUrl || req.user.profilePictureUrl;

    await req.user.save();

    res.json(req.user);
});

export const deleteUser = asyncHandler(async (req, res, next) => {
    const result = await User.deleteOne({ _id: req.user._id });
    if (result.deletedCount === 0) return res.status(500).end();
    res.status(204).end();
});
