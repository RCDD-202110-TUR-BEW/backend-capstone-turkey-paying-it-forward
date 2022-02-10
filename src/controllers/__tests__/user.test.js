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

      const response = await request(server).get(`/api/users/`);

      const responseBody = response.body;

      // eslint-disable-next-line no-underscore-dangle
      userId = responseBody[0]._id;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody.length).toBe(2);
      expect(responseBody[0].username).toBe('new.user');
    });
  });

  describe('GET /api/users/:id', () => {
    test('Should send the correct user in the response', async () => {
      const response = await request(server).get(`/api/users/${userId}`);

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody.username).toBe('new.user');
    });

    test('Should give error when the ID provided is not in the database', async () => {
      const response = await request(server).get(
        `/api/users/507f191e810c19729de860ea`
      );

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        "The user with the specified ID wasn't found"
      );
    });

    test('Should give error when the ID provided is not valid', async () => {
      const response = await request(server).get(`/api/users/invalid9089`);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
    });
  });

  describe('PUT /api/users/:id', () => {
    test('Should update a user and save it to database', async () => {
      const response = await request(server)
        .put(`/api/users/${userId}`)
        .send({ username: 'updated username' });

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody.username).toBe('updated username');
    });

    test('Should give error when the ID provided is not in the database', async () => {
      const response = await request(server).get(
        `/api/users/507f191e810c19729de860ea`
      );

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        "The user with the specified ID wasn't found"
      );
    });
    test('Should give error when the ID provided is not valid', async () => {
      const response = await request(server).get(`/api/users/invalid9089`);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('Should delete the correct user from the database', async () => {
      const response = await request(server).delete(`/api/users/${userId}`);
      expect(response.statusCode).toBe(204);
    });

    test('Should give error when the ID provided is not valid', async () => {
      const response = await request(server).get(`/api/users/invalid9089`);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
    });
  });
});
