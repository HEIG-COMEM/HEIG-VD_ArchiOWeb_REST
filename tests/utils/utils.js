import User from '../../models/user.js';
import Publication from '../../models/publication.js';
import Friend from '../../models/friend.js';
import Comment from '../../models/comment.js';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as config from '../../config.js';

const secretKey = config.secretKey;

export async function cleanUpDatabase() {
    await Promise.all([
        User.deleteMany().exec(),
        Publication.deleteMany().exec(),
        Friend.deleteMany().exec(),
        Comment.deleteMany().exec(),
    ]);
}

export const disconnectDatabase = async () => {
    await mongoose.connection.close();
};

export const generateValidJwt = async (user) => {
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    const payload = { sub: user._id.toString(), exp: exp, scope: user.role };

    return jwt.sign(payload, secretKey);
};

export const createRandomUser = () => {
    return new User({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    });
};

export const createRandomUsers = (count) => {
    return Array.from({ length: count }, createRandomUser);
};

export const createRandomPublication = () => {
    return new Publication({
        frontCamera: {
            path: faker.image.imageUrl(),
        },
        backCamera: {
            path: faker.image.imageUrl(),
        },
        user: 'STATIC-60f3c2b5f3b3a7a8f1b3d1b0',
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    });
};

export const createRandomPublications = (count) => {
    return Array.from({ length: count }, createRandomPublication);
};
