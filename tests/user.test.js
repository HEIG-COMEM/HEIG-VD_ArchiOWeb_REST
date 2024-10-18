import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../app.js';
import { baseUrl } from '../config.js';
import User from '../models/user.js';
import { cleanUpDatabase, createRandomUser, createRandomUsers } from './utils/utils.js';

// Clean up leftover data in the database before starting to test
beforeEach(cleanUpDatabase);

const href = `/api/v1/users`;

describe('User', () => {

    // Test that all users can be retrieved
    // This test doesn't take into account the order of the users
    test('GET /', async () => {
        const response = await supertest(app).get(`${href}/`);
        expect(response.status).toBe(200);
        expect(response.get('Content-Type')).toContain('application/json');
        expect(response.body).toMatchObject([]);

        const userCount = 5;
        const users = createRandomUsers(userCount);
        await Promise.all(users.map(user => user.save()));

        const response2 = await supertest(app).get(`${href}/`);
        expect(response2.status).toBe(200);
        expect(response2.get('Content-Type')).toContain('application/json');

        expect(response2.body).toHaveLength(userCount);
        // compare the response body with the users array (dont take into account the order)
        expect(response2.body).toEqual(expect.arrayContaining(users.map(user => expect.objectContaining({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            profilePictureUrl: user.profilePictureUrl,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        }))));
    });

    // Test that a user can be retrieved by ID
    test('GET /:id', async () => {
        const user = createRandomUser();
        await user.save();

        const response = await supertest(app).get(`${href}/${user._id.toString()}`);
        expect(response.status).toBe(200);
        expect(response.get('Content-Type')).toContain('application/json');
        expect(response.body).toMatchObject({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            profilePictureUrl: user.profilePictureUrl,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        });
    });
});

afterEach(cleanUpDatabase);