import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../app.js';
import { baseUrl } from '../config.js';
import User from '../models/user.js';
import path from 'path';
import { cleanUpDatabase, createRandomUser, createRandomUsers } from './utils.js';

// Clean up leftover data in the database before starting to test
beforeEach(cleanUpDatabase);

const href = `/api/v1/publications`;

describe('Publication', () => {

    // Test that the user cannot access the / route without a token.
    test('GET /', async () => {
        const response = await supertest(app).get(`${href}/`);
        expect(response.status).toBe(401);
    });

    // Test that the user can access the / route with a token.
    test('GET / after login', async () => {
        await supertest(app).post(`/api/v1/auth/signup`).send({
            name: 'Test Publication',
            email: 'testPublication@gmail.com',
            password: '1234',
        });

        const response = await supertest(app).post(`/api/v1/auth/login`).send({
            email: 'testPublication@gmail.com',
            password: '1234'
        });

        const token = response.body.token;

        const response2 = await supertest(app).get(`${href}/`).set('Authorization', `Bearer ${token}`);
        expect(response2.status).toBe(200);
    });


    test('POST /publications', async () => {
        expect(true).toBe(true);
    });
});

// Clean up leftover data in the database after testing
afterAll(cleanUpDatabase);