import mongoose from 'mongoose';
import * as config from '../config.js';
import { seedUsers } from './UsersTableSeeder.js';
import { seedPublications } from './PublicationsTableSeeder.js';
// import { seedFriends } from './FriendsTableSeeder.js';
// import { seedComments } from './CommentsTableSeeder.js';

const runSeeders = async () => {
    try {
        console.log('Running seeders...');
        await mongoose.connect(config.mongoUri);
        await seedUsers();
        console.log('Seed users ran successfully');
        await seedPublications();
        console.log('Seed publications ran successfully');
        // await seedFriends();
        // console.log('Seed friends ran successfully');
        // await seedComments();
        // console.log('Seed comments ran successfully');

        console.log('All seeders ran successfully');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error running seeders:', error);
    }
};

runSeeders();
