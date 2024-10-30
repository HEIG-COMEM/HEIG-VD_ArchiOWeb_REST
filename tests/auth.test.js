import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../app.js';
import { baseUrl } from '../config.js';
import { cleanUpDatabase } from './utils/utils.js';

// Clean up leftover data in the database before starting to test
beforeAll(cleanUpDatabase);

const href = `/api/v1/auth`;

describe('Authentication', () => {
    let token;

    test('POST /signup', async () => {
        const response = await supertest(app).post(`${href}/signup`).send({
            name: 'Test User',
            email: 'testUser@gmail.com',
            role: 'admin', // On purpose to test if the role is not saved
            password: '1234',
        });

        // Check that the status and headers of the response are correct.
        expect(response.status).toBe(201);
        expect(response.get('Content-Type')).toContain('application/json');

        // Check that the response body is the created user.
        // Check that the role is not saved.
        expect(response.body).toMatchObject({
            _id: expect.any(String),
            name: 'Test User',
            email: 'testUser@gmail.com',
            role: 'user',
            profilePictureUrl: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });
    });

    // Test that the user cannot access the /user route without a token.
    test('GET /user', async () => {
        const response = await supertest(app).get(`${href}/user`);
        expect(response.status).toBe(401);
    });

    // Test that the user can log in and get a token.
    test('POST /login', async () => {
        const response = await supertest(app).post(`${href}/login`).send({
            email: 'testUser@gmail.com',
            password: '1234',
        });

        expect(response.status).toBe(200);
        expect(response.get('Content-Type')).toContain('application/json');
        expect(response.body).toMatchObject({
            token: expect.any(String),
        });

        token = response.body.token;
    });

    // Test that the user can access the /user route with a token.
    test('GET /user after login', async () => {
        const response = await supertest(app)
            .get(`${href}/user`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.get('Content-Type')).toContain('application/json');

        // Check that the response body is the logged in user.
        expect(response.body).toMatchObject({
            _id: expect.any(String),
            name: 'Test User',
            email: 'testUser@gmail.com',
            profilePictureUrl: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });
    });
});

// Clean up leftover data in the database after testing
afterAll(cleanUpDatabase);
