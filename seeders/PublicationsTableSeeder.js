import Publication from '../models/publication.js';
import User from '../models/user.js';
import { faker } from '@faker-js/faker';

export const seedPublications = async () => {
    // Clear existing publications
    await Publication.deleteMany();

    // Fetch all users to associate publications with them
    const users = await User.find();

    // Create random publications
    const publications = users.map((user) => ({
        frontCamera: {
            url: faker.image.imageUrl(),
            id: faker.database.mongodbObjectId(),
        },
        backCamera: {
            url: faker.image.imageUrl(),
            id: faker.database.mongodbObjectId(),
        },
        user: user._id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    }));

    // Insert new publications
    await Publication.insertMany(publications);

    console.log('Publications seeded successfully');
};
