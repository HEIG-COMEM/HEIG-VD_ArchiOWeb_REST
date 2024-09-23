import User from '../models/user';
import { faker } from '@faker-js/faker';

export async function cleanUpDatabase() {
    await Promise.all([User.deleteMany().exec()]);
}

export const createRandomUser = () => {
    return new User({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: ['employer', 'job_seeker'][Math.floor(Math.random() * 2)],
        phone: faker.phone.number({ style: 'international' }),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
    });
}

export const createRandomUsers = (count) => {
    return Array.from({ length: count }, createRandomUser);
}