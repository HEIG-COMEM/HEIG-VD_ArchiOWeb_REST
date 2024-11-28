import supertest from 'supertest';
import { createRandomUser, generateValidJwt } from './utils/utils.js';
import app from '../app.js';
import { cleanUpDatabase, disconnectDatabase } from './utils/utils.js';

// Clean up leftover data in the database before starting to test and create a new user to get a token
const user = await createRandomUser().save();
const adminUser = await createRandomUser({ role: 'admin' }).save();
const jwt = await generateValidJwt(user);
const adminJwt = await generateValidJwt(adminUser);

beforeEach(cleanUpDatabase);

const href = `/api/v1/admin/notifications`;

describe('POST /admin/notifications', () => {
    test('test that the user can not create a notification', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                message: 'Hello, World!',
            });
        expect(response.status).toBe(403);
    });
    test('test that the admin can create a notification', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${adminJwt}`);
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            _id: expect.any(String),
            content: 'Time to be real',
            type: 'bereal',
            sentAt: expect.any(String),
            oneSignalNotificationId: expect.any(String),
        });
    });
    test('test that the admin can not create more than one notification per day', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${adminJwt}`);
        expect(response.status).toBe(201);
        const response2 = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${adminJwt}`);
        expect(response2.status).toBe(400);
    });
});

afterAll(disconnectDatabase);
