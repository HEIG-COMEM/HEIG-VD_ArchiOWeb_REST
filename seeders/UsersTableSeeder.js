import User from '../models/user.js';
import { el, faker } from '@faker-js/faker';
import * as config from '../config.js';

export const seedUsers = async () => {
    const createRandomUser = ({
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
        return {
            name,
            email,
            password,
            role,
            createdAt,
            updatedAt,
        };
    };

    const users = Array.from({ length: 10 }, () => createRandomUser());

    const admin = createRandomUser({
        name: 'admin',
        email: config.seedAdminEmail,
        password: config.seedAdminPassword,
        role: 'admin',
    });

    await new User(admin).save();

    return Promise.all(
        users.map(async (user) => {
            await new User(user).save();
        })
    );
};
