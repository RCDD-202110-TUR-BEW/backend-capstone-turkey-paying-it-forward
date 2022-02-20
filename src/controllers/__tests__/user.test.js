const request = require('supertest');

const server = require('../../app');

const { closeDatabase, clearDatabase } = require('../../db/connection');

let userId;

let userIdDonator;

const invalidId = 'invalidId123';

const notExistingUserId = '937c7f79bcf86ce7863f5d0a';

const newValidUser = {
  username: 'swarley',
  firstName: 'Barney',
  lastName: 'Stinson',
  email: 'iamawesome@gmail.com',
  password: 'suitup1A!',
  passwordConfirm: 'suitup1A!',
  address: '3rd Avenue Manhattan',
};

const newValidUser2 = {
  username: 'schmosby',
  firstName: 'Ted',
  lastName: 'Mosby',
  email: 'mosbythearchitect@gmail.com',
  password: 'haveyoumetme1A!',
  passwordConfirm: 'haveyoumetme1A!',
  address: '16 West 82nd Street',
};

const expectedValidUser = {
  username: 'swarley',
  firstName: 'Barney',
  lastName: 'Stinson',
  email: 'iamawesome@gmail.com',
  address: '3rd Avenue Manhattan',
};

const expectedValidUser2 = {
  username: 'schmosby',
  firstName: 'Ted',
  lastName: 'Mosby',
  email: 'mosbythearchitect@gmail.com',
  address: '16 West 82nd Street',
};

const updatedUser = {
  username: 'goforbarney',
  firstName: 'Barney',
  lastName: 'Stinson',
  email: 'iamawesome@gmail.com',
  address: '3rd Avenue Manhattan',
};

const donatorUser = {
  username: 'anne.frank',
  firstName: 'Anne',
  lastName: 'Frank',
  email: 'annefrank@gmail.com',
  password: 'Password123',
  passwordConfirm: 'Password123',
  address: 'Croissant Avenue, Paris',
};

const notDonatorUser = {
  username: 'aisha.michael',
  firstName: 'Aisha',
  lastName: 'Michael',
  email: 'aishamichael@yahoo.com',
  password: '123Password',
  passwordConfirm: '123Password',
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

    test('Should send all the users from database in the response', async () => {
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
    test('Should update the requested details of the correct user', async () => {
      const response = await request(server)
        .put(`/api/users/${userId}`)
        .send({ username: 'goforbarney' });

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody).toMatchObject(updatedUser);
    });

    test('Should response with an error message when requested user ID does not exist', async () => {
      const response = await request(server).put(
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
      const response = await request(server).put(`/api/users/${invalidId}`);
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

      const checkUserDeleted = await request(server).get(
        `/api/users/${userId}`
      );
      const responseBody = checkUserDeleted.body;

      expect(checkUserDeleted.header['content-type']).toContain(
        'application/json'
      );
      expect(checkUserDeleted.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        "The user with the specified ID wasn't found"
      );
    });

    test('Should response with an error message when requested user ID is not valid', async () => {
      const response = await request(server).delete(`/api/users/${invalidId}`);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('Requested user ID is not valid!');
    });

    test('Should response with an error message when requested user ID does not exist', async () => {
      const response = await request(server).delete(
        `/api/users/${notExistingUserId}`
      );

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        "The user with the specified ID wasn't found"
      );
    });
  });

  describe('GET /api/global/donators', () => {
    test('Should response with an error message when there are no donators', async () => {
      await clearDatabase();
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

      userIdDonator = responseBody[0]._id;

      // Following endpoint is called to set isDonator field to true
      await request(server)
        .put(`/api/users/${userIdDonator}`)
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
