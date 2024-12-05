import User from '../../models/user.js';
import Publication from '../../models/publication.js';
import Friend from '../../models/friend.js';
import Comment from '../../models/comment.js';
import Notification from '../../models/notification.js';
import { el, faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as config from '../../config.js';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});

const secretKey = config.secretKey;

export async function cleanUpDatabase() {
    await Promise.all([
        User.deleteMany().exec(),
        Publication.deleteMany().exec(),
        Friend.deleteMany().exec(),
        Comment.deleteMany().exec(),
        Notification.deleteMany().exec(),
    ]);
}

export const disconnectDatabase = async () => {
    await mongoose.disconnect();
};

export const removeImagesFromCDN = async () => {
    await cloudinary.api.delete_resources_by_tag(`test`);
};

export const generateValidJwt = async (user) => {
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    const payload = { sub: user._id.toString(), exp: exp, scope: user.role };

    return jwt.sign(payload, secretKey);
};

export const createRandomUser = ({
    name = null,
    email = faker.internet.email(),
    password = faker.internet.password(),
    role = 'user',
    createdAt = faker.date.past(),
    updatedAt = faker.date.recent(),
} = {}) => {
    if (!name) {
        name = faker.internet.userName();
        if (name.length < 2) {
            name = 'tiny';
        } else if (name.length > 29) {
            name = name.substring(0, 28);
            name += el.random.alphaNumeric(1);
        }
        name = name.replace(/-/g, '_');
    }
    return new User({
        name,
        email,
        password,
        role,
        createdAt,
        updatedAt,
    });
};

export const createRandomUsers = (count) => {
    return Array.from({ length: count }, createRandomUser);
};

export const createRandomPublication = (user) => {
    return new Publication({
        frontCamera: {
            url: faker.image.url(),
            id: faker.database.mongodbObjectId(),
        },
        backCamera: {
            url: faker.image.url(),
            id: faker.database.mongodbObjectId(),
        },
        location: {
            type: 'Point',
            coordinates: [
                faker.location.longitude(),
                faker.location.latitude(),
            ],
        },
        user: user._id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    });
};

export const createRandomPublications = (count) => {
    return Array.from({ length: count }, createRandomPublication);
};

export const createRandomComment = (
    user,
    publication,
    parentComment = null
) => {
    return new Comment({
        content: faker.lorem.sentence(),
        user: user._id,
        publication: publication._id,
        parentComment: parentComment ? parentComment._id : null,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    });
};

export const createFriendship = async (user, friend, status = null) => {
    const friendship = await Friend.addFriend(user._id, friend._id);
    if (status) {
        friendship.status = status;
        await friendship.save();
    }
    return friendship;
};
