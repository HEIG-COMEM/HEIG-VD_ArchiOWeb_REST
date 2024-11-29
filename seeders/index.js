import mongoose from 'mongoose';
import * as config from '../config.js';
import { seedUsers } from './UsersTableSeeder.js';
import { seedPublications } from './PublicationsTableSeeder.js';
import { seedFriends } from './FriendsTableSeeder.js';
import { seedComments, seedAnswers } from './CommentsTableSeeder.js';

import User from '../models/user.js';
import Publication from '../models/publication.js';
import Friend from '../models/friend.js';
import Comment from '../models/comment.js';

const cleanUpDatabase = async () => {
    await Promise.all([
        User.deleteMany().exec(),
        Publication.deleteMany().exec(),
        Friend.deleteMany().exec(),
        Comment.deleteMany().exec(),
    ]);
};

const runSeeders = async () => {
    try {
        console.log('Running seeders...');
        await mongoose.connect(config.mongoUri);

        await cleanUpDatabase();

        await seedUsers();
        await seedPublications();
        await seedFriends();
        await seedComments();
        await seedAnswers();

        console.log('All seeders ran successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error running seeders:', error);
    }
};

runSeeders();
