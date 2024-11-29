import supertest from 'supertest';
import {
    createRandomPublication,
    createRandomUser,
    generateValidJwt,
} from './utils/utils.js';
import app from '../app.js';
import { cleanUpDatabase, disconnectDatabase } from './utils/utils.js';
import path from 'path';

const user = await createRandomUser().save();
const adminUser = await createRandomUser({ role: 'admin' }).save();
const jwt = await generateValidJwt(user);
const adminJwt = await generateValidJwt(adminUser);

beforeEach(cleanUpDatabase);

const href = `/api/v1/publications`;

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const frontImagePath = path.resolve(__dirname, 'utils/img/', 'test-front.jpeg');
const backImagePath = path.resolve(__dirname, 'utils/img/', 'test-back.jpg');

describe('GET /publications', () => {
    test('test that the user can get all publications', async () => {
        await createRandomPublication(user).save();
        await createRandomPublication(user).save();
        await createRandomPublication(user).save();

        const response = await supertest(app)
            .get(`${href}`)
            .set('Authorization', `Bearer ${jwt}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(3);
    });
});

describe('GET /publications/:id', () => {
    test('test that the user can get a publication by id', async () => {
        const publication = await createRandomPublication(user).save();

        const response = await supertest(app)
            .get(`${href}/${publication._id}`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            _id: publication._id.toString(),
            frontCamera: expect.objectContaining({
                url: expect.any(String),
                id: expect.any(String),
            }),
            backCamera: expect.objectContaining({
                url: expect.any(String),
                id: expect.any(String),
            }),
            user: expect.stringMatching(user._id.toString()),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });
    });

    test('test that the user cannot get a publication by an invalid id', async () => {
        const response = await supertest(app)
            .get(`${href}/123`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.status).toBe(400);
    });

    test('test that the user cannot get a publication by a non-existing id', async () => {
        const response = await supertest(app)
            .get(`${href}/60b5b8e3e4f0f5e5b4e1d1f4`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.status).toBe(404);
    });
});

describe('POST /publications', () => {
    test('test that the user can create a new publication with valid data', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${jwt}`)
            .attach('frontCamera', frontImagePath, {
                contentType: 'multipart/form-data',
            })
            .attach('backCamera', backImagePath, {
                contentType: 'multipart/form-data',
            });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            frontCamera: expect.objectContaining({
                url: expect.any(String),
                id: expect.any(String),
            }),
            backCamera: expect.objectContaining({
                url: expect.any(String),
                id: expect.any(String),
            }),
            user: expect.stringMatching(user._id.toString()),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });

        const deleteResponse = await supertest(app)
            .delete(`${href}/${response.body._id}`)
            .set('Authorization', `Bearer ${adminJwt}`);
        expect(deleteResponse.status).toBe(204);
    });

    test('test that the user cannot create a new publication without an image', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.status).toBe(400);
    });

    test('test that the user cannot create a new publication without a frontCamera image', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${jwt}`)
            .attach('backCamera', backImagePath, {
                contentType: 'multipart/form-data',
            });

        expect(response.status).toBe(400);
    });

    test('test that the user cannot create a new publication without a backCamera image', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${jwt}`)
            .attach('frontCamera', frontImagePath, {
                contentType: 'multipart/form-data',
            });

        expect(response.status).toBe(400);
    });

    test('test that the user cannot create a new publication without a token', async () => {
        const response = await supertest(app).post(`${href}`);

        expect(response.status).toBe(401);
    });
});

describe('DELETE /publications/:id', () => {
    let publication;
    beforeEach(async () => {
        publication = await createRandomPublication(user).save();
    });

    test('test that the admin can delete a publication by id', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${jwt}`)
            .attach('frontCamera', frontImagePath, {
                contentType: 'multipart/form-data',
            })
            .attach('backCamera', backImagePath, {
                contentType: 'multipart/form-data',
            });

        expect(response.status).toBe(201);

        const deleteResponse = await supertest(app)
            .delete(`${href}/${response.body._id}`)
            .set('Authorization', `Bearer ${adminJwt}`);
        expect(deleteResponse.status).toBe(204);
    });

    test('test that the user cannot delete a publication', async () => {
        const response = await supertest(app)
            .delete(`${href}/${publication._id}`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.status).toBe(403);
    });

    test('test that the admin cannot delete a publication by an invalid id', async () => {
        const response = await supertest(app)
            .delete(`${href}/123`)
            .set('Authorization', `Bearer ${adminJwt}`);

        expect(response.status).toBe(400);
    });

    test('test that the admin cannot delete a publication by a non-existing id', async () => {
        const response = await supertest(app)
            .delete(`${href}/60b5b8e3e4f0f5e5b4e1d1f4`)
            .set('Authorization', `Bearer ${adminJwt}`);

        expect(response.status).toBe(404);
    });
});

// Clean up leftover data in the database after testing
afterAll(disconnectDatabase);
