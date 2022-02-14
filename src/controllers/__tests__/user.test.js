const request = require('supertest');

const server = require('../../app');

const {
  closeDatabase,
  clearDatabase,
  connectToMongo,
} = require('../../db/connection');

let userId;

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
