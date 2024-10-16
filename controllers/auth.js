import bcrypt from "bcrypt";
import { promisify } from "util";
import { asyncHandler } from "../utils/wrapper.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import * as config from '../config.js';

const signJwt = promisify(jwt.sign);
const secretKey = config.secretKey;

export const signup = asyncHandler(async (req, res, next) => {
    const plainPassword = req.body.password;
    const costFactor = 10;

    const hashedPassword = await bcrypt.hash(plainPassword, costFactor);
    const newUser = new User(req.body);
    newUser.password = hashedPassword;
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
});

export const login = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.sendStatus(401); // Unauthorized

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.sendStatus(401); // Unauthorized

    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    const payload = { sub: user._id.toString(), exp: exp, scope: user.role };

    const token = await signJwt(payload, secretKey);

    res.json({ token });
});

export const getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.currentUserId);
    if (!user) return res.sendStatus(404); // Not Found

    res.json(user);
});