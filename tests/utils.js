import User from '../models/user';
import Publication from '../models/publication';
import { faker } from '@faker-js/faker';

export async function cleanUpDatabase() {
    await Promise.all([User.deleteMany().exec(), Publication.deleteMany().exec()]);
}

export const createRandomUser = () => {
    return new User({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    });
}

export const createRandomUsers = (count) => {
    return Array.from({ length: count }, createRandomUser);
}