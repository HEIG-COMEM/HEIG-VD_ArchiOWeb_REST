import bcrypt from "bcrypt";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import * as config from '../config.js';

const signJwt = promisify(jwt.sign);
const secretKey = config.secretKey;

export const signup = (req, res, next) => {
    const plainPassword = req.body.password;
    const costFactor = 10;

    bcrypt.hash(plainPassword, costFactor)
        .then(hashedPassword => {
            const newUser = new User(req.body);
            newUser.password = hashedPassword;
            return newUser.save();
        })
        .then(savedUser => {
            res.status(201).json(savedUser);
        })
        .catch(next);
}

export const login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (!user) return res.sendStatus(401); // Unauthorized
            return bcrypt.compare(req.body.password, user.password).then(valid => {
                if (!valid) return res.sendStatus(401); // Unauthorized

                const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
                const payload = { sub: user._id.toString(), exp: exp, scope: user.role };

                return signJwt(payload, secretKey).then(token => {
                    res.json({ token });
                });
            });
        })
        .catch(next);
}

export const getUser = (req, res, next) => {
    const currentUserId = req.currentUserId;

    User.findById(currentUserId)
        .exec()
        .then(user => {
            if (!user) return res.sendStatus(404); // Not Found
            res.json(user);
        })
        .catch(next);
}