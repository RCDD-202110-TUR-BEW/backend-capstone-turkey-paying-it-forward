const request = require('supertest');

const server = require('../../app');

const {
  closeDatabase,
  clearDatabase,
  connectToMongo,
} = require('../../db/connection');

let userId;

const newValidUser = {
  username: 'new.user',
  firstName: 'New',
  lastName: 'User',
  email: 'email@domain.com',
  password: 'testPassword',
  password2: 'testPassword',
  address: 'new address',
  acceptTos: 'on',
};

const newValidUser2 = {
  username: 'new.user2',
  firstName: 'New2',
  lastName: 'User2',
  email: 'email2@domain.com',
  password: 'testPassword2',
  password2: 'testPassword2',
  address: 'new address2',
  acceptTos: 'on',
};

describe('User Endpoints', () => {
  beforeAll(async () => {
    connectToMongo();
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
    server.close();
  });

  describe('GET /api/global/donators', () => {
    test('Should response with an error message when there are no donators', async () => {
      const response = await request(server).get('/api/global/donators');

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('No donators found');
    });

    test('Should send just those users who are donators in the response', async () => {
      await request(server)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(newValidUser);

      await request(server)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(newValidUser2);

      const response = await request(server).get('/api/users');

      const responseBody = response.body;

      // eslint-disable-next-line no-underscore-dangle
      userId = responseBody[0]._id;

      await request(server)
        .put(`/api/users/${userId}`)
        .set('Content-Type', 'application/json')
        .send({ isDonator: true });

      const res = await request(server).get('/api/global/donators');

      expect(res.header['content-type']).toContain('application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe('new.user');
    });
  });
});
