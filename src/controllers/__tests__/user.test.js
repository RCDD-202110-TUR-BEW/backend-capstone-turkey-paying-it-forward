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
    await clearDatabase();
    await closeDatabase();
    server.close();
  });

  describe('GET /api/users/', () => {
    test('Should send the all the users from database in the response', async () => {
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
      console.log(responseBody);
      // eslint-disable-next-line no-underscore-dangle
      userId = responseBody[0]._id;
      console.log(userId);
      await request(server)
        .put(`/api/users/${userId}`)
        .set('Content-Type', 'application/json')
        .send({ isDonator: true });

      const res = await request(server).get('/api/global/donators');

      expect(res.header['content-type']).toContain('application/json');
      expect(res.statusCode).toBe(200);
      // expect(responseBody.length).toBe(2);
      expect(responseBody[0].username).toBe('new.user');
    });
  });
});
