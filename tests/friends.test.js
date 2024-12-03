import supertest from 'supertest';

import app from '../app.js';
import {
    cleanUpDatabase,
    createRandomUser,
    disconnectDatabase,
    generateValidJwt,
    createFriendship,
} from './utils/utils.js';

// Clean up leftover data in the database before starting to test
beforeEach(cleanUpDatabase);

const href = `/api/v1/friends`;

let user;
let userJwt;
let friends;
let pendingFriends;
let pendingUsers;
let friendships;

// Create accepted and pending friendships as well as pending users
beforeEach(async () => {
    user = await createRandomUser().save();
    userJwt = await generateValidJwt(user);
    friends = [
        // ppl who the user is friends with
        await createRandomUser().save(),
        await createRandomUser().save(),
        await createRandomUser().save(),
        await createRandomUser().save(),
        await createRandomUser().save(),
    ];
    pendingFriends = [
        // ppl who the user has sent a friend request to
        await createRandomUser().save(),
        await createRandomUser().save(),
    ];
    pendingUsers = [
        // ppl who have sent a friend request to the user
        await createRandomUser().save(),
    ];

    friendships = [
        ...(await Promise.all(
            friends.map((friend) => createFriendship(user, friend, 'accepted'))
        )),
        ...(await Promise.all(
            pendingFriends.map((friend) => createFriendship(user, friend))
        )),
        ...(await Promise.all(
            pendingUsers.map((friend) => createFriendship(friend, user))
        )),
    ];
});

describe('GET /friends', () => {
    test('test that the user can see all friendships', async () => {
        const response = await supertest(app)
            .get(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(
            friendships.length - pendingFriends.length
        );
    });

    test('test that the user can see only accepted friendships', async () => {
        const response = await supertest(app)
            .get(`${href}?status=accepted`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(friends.length);
    });

    test('test that the user can see only pending friendships', async () => {
        const response = await supertest(app)
            .get(`${href}?status=pending`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(friendships.length - friends.length);
    });
});

describe('POST /friends', () => {
    test('test that the user can send a friend request', async () => {
        const friend = await createRandomUser().save();
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ friendId: friend._id });

        expect(response.status).toBe(201);
        expect(response.body.users).toHaveLength(2);
        expect(response.body.status).toBe('pending');
    });

    test('test that the user cannot send a friend request to themselves', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ friendId: user._id });

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot send a friend request to an existing friend', async () => {
        const friend = friends[0];
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ friendId: friend._id });

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot send a friend request to a pending friend', async () => {
        const friend = pendingFriends[0];
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ friendId: friend._id });

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot send a friend request to a user who has sent a friend request', async () => {
        const friend = pendingUsers[0];
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ friendId: friend._id });

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot send a friend request to a nonexistent user', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ friendId: '123456789012' });

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot send a friend request without a friendId', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot send a friend request with an invalid friendId', async () => {
        const response = await supertest(app)
            .post(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ friendId: 'invalid' });

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });
});

describe('PATCH /friends/:friendshipId', () => {
    test('test that the user can accept a friend request', async () => {
        const friend = await createRandomUser().save();
        const friendship = await createFriendship(friend, user);
        const response = await supertest(app)
            .patch(`${href}/${friendship._id}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ status: 'accepted' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('accepted');
    });

    test('test that the user can reject a friend request', async () => {
        const friend = await createRandomUser().save();
        const friendship = await createFriendship(friend, user);
        const response = await supertest(app)
            .patch(`${href}/${friendship._id}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ status: 'denied' });

        expect(response.status).toBe(204);
    });

    test('test that the user cannot accept a friend request that they have sent', async () => {
        const friend = await createRandomUser().save();
        const friendship = await createFriendship(user, friend);
        const response = await supertest(app)
            .patch(`${href}/${friendship._id}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ status: 'accepted' });

        expect(response.status).toBe(403);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot reject a friend request that they have sent', async () => {
        const friend = await createRandomUser().save();
        const friendship = await createFriendship(user, friend);
        const response = await supertest(app)
            .patch(`${href}/${friendship._id}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ status: 'denied' });

        expect(response.status).toBe(403);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot accept a friend request that does not exist', async () => {
        const response = await supertest(app)
            .patch(`${href}/123456789012`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ status: 'accepted' });

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot reject a friend request that does not exist', async () => {
        const response = await supertest(app)
            .patch(`${href}/123456789012`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ status: 'denied' });

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot accept a friend request that is already accepted', async () => {
        const friend = await createRandomUser().save();
        const friendship = await createFriendship(friend, user, 'accepted');

        const response = await supertest(app)
            .patch(`${href}/${friendship._id.toString()}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ status: 'accepted' });

        expect(response.status).toBe(404);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot reject a friend request that is already accepted', async () => {
        const friend = await createRandomUser().save();
        const friendship = await createFriendship(friend, user, 'accepted');

        const response = await supertest(app)
            .patch(`${href}/${friendship._id.toString()}`)
            .set('Authorization', `Bearer ${userJwt}`)
            .send({ status: 'denied' });

        expect(response.status).toBe(404);
        expect(response).toHaveProperty('text');
    });
});

describe('DELETE /friends/:friendshipId', () => {
    test('test that the user can remove a friendship that they are friends with', async () => {
        const friendship = friendships.at(1);

        const response = await supertest(app)
            .delete(`${href}/${friendship._id}`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(204);
    });

    test('test that the user cannot remove a friendship that does not exist', async () => {
        const response = await supertest(app)
            .delete(`${href}/123456789012`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(400);
        expect(response).toHaveProperty('text');
    });

    test('test that the user cannot remove a friendship that they do not belong to', async () => {
        const u1 = await createRandomUser().save();
        const u2 = await createRandomUser().save();
        const friendship = await createFriendship(u1, u2, 'accepted');

        const response = await supertest(app)
            .delete(`${href}/${friendship._id}`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(403);
        expect(response).toHaveProperty('text');
    });
});

afterAll(disconnectDatabase);
