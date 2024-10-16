import User from "../models/user.js";
import { asyncHandler } from "../utils/wrapper.js";

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
    const user = await User.findById(req.params.id);
    res.json(user);
});