import User from '../models/user.js';

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
