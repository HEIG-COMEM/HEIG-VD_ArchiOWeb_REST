import { faker } from '@faker-js/faker';

import Comment from '../models/comment.js';
import User from '../models/user.js';
import Publication from '../models/publication.js';

export const seedComments = async () => {
    const users = await User.find();
    const publications = await Publication.find();

    return Promise.all(
        publications.map(async (publication) => {
            const comments = users.map((user) => {
                return {
                    user: user._id,
                    publication: publication._id,
                    content: faker.lorem.sentence(),
                };
            });

            return Comment.insertMany(comments);
        })
    );
};

export const seedAnswers = async () => {
    const users = await User.find();
    const comments = await Comment.find();

    const commentsToReply = comments.filter(() => Math.random() > 0.5);

    return Promise.all(
        commentsToReply.map(async (comment) => {
            const user = users[Math.floor(Math.random() * users.length)];

            return Comment.create({
                user: user._id,
                publication: comment.publication,
                content: faker.lorem.sentence(),
                parentComment: comment._id,
            });
        })
    );
};
