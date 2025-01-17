import supertest from 'supertest';
import {
    createRandomPublication,
    createRandomUser,
    generateValidJwt,
    createFriendship,
} from './utils/utils.js';
import app from '../app.js';
import { cleanUpDatabase, disconnectDatabase } from './utils/utils.js';
import path from 'path';

const href = `/api/v1/publications`;

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const frontImagePath = path.join(__dirname, 'utils', 'img', 'test-front.jpeg');
const backImagePath = path.join(__dirname, 'utils', 'img', 'test-back.jpg');

let user;
let friend;
let friends;
let notFriend;
let adminUser;
let jwt;
let adminJwt;

beforeEach(async () => {
    await cleanUpDatabase();
    user = await createRandomUser().save();
    friend = await createRandomUser().save();
    notFriend = await createRandomUser().save();
    friends = [
        // ppl who the user is friends with
        friend,
    ];
    await Promise.all(
        friends.map((friend) => createFriendship(user, friend, 'accepted'))
    );
    adminUser = await createRandomUser({ role: 'admin' }).save();
    jwt = await generateValidJwt(user);
    adminJwt = await generateValidJwt(adminUser);
});

describe('GET /publications', () => {
    test('test that the user without friends get no publications', async () => {
        await createRandomPublication(user).save();
        await createRandomPublication(user).save();
        await createRandomPublication(user).save();

        const response = await supertest(app)
            .get(`${href}`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
    });
});

describe('GET /publications', () => {
    test('test that the user can get all friends publications', async () => {
        await createRandomPublication(user).save();
        const pubFriend = await createRandomPublication(friend).save();
        await createRandomPublication(notFriend).save();

        const response = await supertest(app)
            .get(`${href}`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]._id).toBe(pubFriend._id.toString());
    });
});

describe('GET /publications', () => {
    test('test that the user can not get the admin publications', async () => {
        const response = await supertest(app)
            .get(`${href}?userId=${adminUser._id}`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.status).toBe(403);
        expect(response.body).toMatchObject({
            message: 'You are not authorized to view this feed',
        });
    });
});

describe('GET /publications', () => {
    test('test that the user can get the publications of is friend', async () => {
        await createRandomPublication(user).save();
        const pubFriend = await createRandomPublication(friend).save();
        await createRandomPublication(notFriend).save();

        const response = await supertest(app)
            .get(`${href}?userId=${friend._id}`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]._id).toBe(pubFriend._id.toString());
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
            location: expect.objectContaining({
                type: 'Point',
                coordinates: [expect.toBeNumber(), expect.toBeNumber()],
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
            .field('lat', '37.7749')
            .field('lng', '-122.4194')
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
            location: expect.objectContaining({
                type: 'Point',
                coordinates: [expect.toBeNumber(), expect.toBeNumber()],
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

    test('test that the user cannot create a new publication without a location', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${jwt}`)
            .attach('frontCamera', frontImagePath, {
                contentType: 'multipart/form-data',
            })
            .attach('backCamera', backImagePath, {
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
            .field('lat', '37.7749')
            .field('lng', '-122.4194')
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
