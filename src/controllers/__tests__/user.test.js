const request = require('supertest');

const server = require('../../app');

const {
  closeDatabase,
  clearDatabase,
  connectToMongo,
} = require('../../db/connection');

let userId;

const invalidId = 'invalidId123';

const notExistingUserId = '937c7f79bcf86ce7863f5d0a';

const newValidUser = {
  username: 'new.user',
  firstName: 'New',
  lastName: 'User',
  email: 'email@domain.com',
  password: 'testPassword',
  password2: 'testPassword',
  address: 'new address',
};

const newValidUser2 = {
  username: 'new.user2',
  firstName: 'New2',
  lastName: 'User2',
  email: 'email2@domain.com',
  password: 'testPassword2',
  password2: 'testPassword2',
  address: 'new address2',
};

const expectedValidUser = {
  username: 'new.user',
  firstName: 'New',
  lastName: 'User',
  email: 'email@domain.com',
  address: 'new address',
};

const expectedValidUser2 = {
  username: 'new.user2',
  firstName: 'New2',
  lastName: 'User2',
  email: 'email2@domain.com',
  address: 'new address2',
};

const updatedUser = {
  username: 'updated username',
  firstName: 'New',
  lastName: 'User',
  email: 'email@domain.com',
  address: 'new address',
};

const donatorUser = {
  username: 'anne.frank',
  firstName: 'Anne',
  lastName: 'Frank',
  email: 'annefrank@gmail.com',
  password: 'password123',
  passwordConfirm: 'password123',
  address: 'Croissant Avenue, Paris',
};

const notDonatorUser = {
  username: 'aisha.michael',
  firstName: 'Aisha',
  lastName: 'Michael',
  email: 'aishamichael@yahoo.com',
  password: '123password',
  passwordConfirm: '123password',
  address: 'Gelato Avenue, Rome',
};

const expectedDonatorResponse = {
  username: 'anne.frank',
  firstName: 'Anne',
  lastName: 'Frank',
  email: 'annefrank@gmail.com',
  address: 'Croissant Avenue, Paris',
  isDonator: true,
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
    test('Should response with an error message when there are no users', async () => {
      const response = await request(server).get(`/api/users/`);

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('There are no users at the moment!');
    });

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
      expect(responseBody[0]).toMatchObject(expectedValidUser);
      expect(responseBody[1]).toMatchObject(expectedValidUser2);
    });
  });

  describe('GET /api/users/:id', () => {
    test('Should send the correct user in the response', async () => {
      const response = await request(server).get(`/api/users/${userId}`);

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody).toMatchObject(expectedValidUser);
    });

    test('Should response with an error message when requested user ID does not exist', async () => {
      const response = await request(server).get(
        `/api/users/${notExistingUserId}`
      );

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        "The user with the specified ID wasn't found"
      );
    });

    test('Should response with an error message when requested user ID is not valid', async () => {
      const response = await request(server).get(`/api/users/${invalidId}`);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('Requested user ID is not valid!');
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
      expect(responseBody).toMatchObject(updatedUser);
    });

    test('Should response with an error message when requested user ID does not exist', async () => {
      const response = await request(server).get(
        `/api/users/${notExistingUserId}`
      );

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        "The user with the specified ID wasn't found"
      );
    });
    test('Should response with an error message when requested user ID is not valid', async () => {
      const response = await request(server).get(`/api/users/${invalidId}`);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('Requested user ID is not valid!');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('Should delete the correct user from the database', async () => {
      const response = await request(server).delete(`/api/users/${userId}`);
      expect(response.statusCode).toBe(204);
    });

    test('Should response with an error message when requested user ID is not valid', async () => {
      const response = await request(server).get(`/api/users/${invalidId}`);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('Requested user ID is not valid!');
    });
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
        .send(donatorUser);

      // Following endpoint is called to sign up the user,
      // When the user signs up the default for isDonator field is false
      await request(server)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(notDonatorUser);

      const response = await request(server).get('/api/users');

      const responseBody = response.body;

      // eslint-disable-next-line no-underscore-dangle
      userId = responseBody[0]._id;

      // Following endpoint is called to set isDonator field to true
      await request(server)
        .put(`/api/users/${userId}`)
        .set('Content-Type', 'application/json')
        .send({ isDonator: true });

      const res = await request(server).get('/api/global/donators');

      expect(res.header['content-type']).toContain('application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toMatchObject(expectedDonatorResponse);
    });
  });
});
