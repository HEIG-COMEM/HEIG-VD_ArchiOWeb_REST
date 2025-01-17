import { promisify } from 'util';
import { asyncHandler } from '../utils/wrapper.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import * as config from '../config.js';

const signJwt = promisify(jwt.sign);
const secretKey = config.secretKey;

export const signup = asyncHandler(async (req, res, next) => {
    // Prevent users from setting their role during signup and falling back to the default role.
    req.body.role = undefined;

    if (!req.body.name || !req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ message: 'Fields name, email, and password are required' });
    }

    // Create a new user and save it to the database
    const newUser = new User(req.body);
    try {
        await newUser.save();
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(422).json({ message: error.message });
        }
        return next(error);
    }

    res.status(201).json(newUser);
});

export const login = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(401).json({ message: 'Invalid email or password' });

    if (!req.body.password)
        return res.status(401).json({ message: 'Invalid email or password' });

    const valid = await user.comparePassword(req.body.password);
    if (!valid)
        return res.status(401).json({ message: 'Invalid email or password' });

    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    const payload = { sub: user._id.toString(), exp: exp, scope: user.role };

    const token = await signJwt(payload, secretKey);

    res.json({ token });
});

export const getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.currentUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
});
