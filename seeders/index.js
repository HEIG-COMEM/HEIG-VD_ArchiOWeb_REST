import mongoose from 'mongoose';
import * as config from '../config.js';
import { seedUsers } from './UsersTableSeeder.js';
// Importez d'autres seeders ici si nécessaire

const runSeeders = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        await seedUsers();
        console.log('All seeders ran successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error running seeders:', error);
    }
};

runSeeders();
