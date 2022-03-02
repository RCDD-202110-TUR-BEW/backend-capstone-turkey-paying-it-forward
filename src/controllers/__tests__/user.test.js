const request = require('supertest');
const server = require('../../app');

const { closeDatabase, clearDatabase } = require('../../db/connection');

jest.setTimeout(10000);

let authCookie;
let newAuthCookie;
let userId;
let toBeRatedUserId;
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

const newValidUser3 = {
  username: 'schmos',
  firstName: 'Teddy',
  lastName: 'Mosty',
  email: 'mostyschmosty@gmail.com',
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
    await clearDatabase();
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
      // This request is sent to retrieve the auth cookie
      const signInResponse = await request(server)
        .post(`/api/auth/signin`)
        .set('Content-Type', 'application/json')
        .send({
          username: newValidUser.username,
          password: newValidUser.password,
        });

      [authCookie] = signInResponse.headers['set-cookie'];

      const response = await request(server)
        .put(`/api/users/${userId}`)
        .set('Cookie', authCookie)
        .send({ username: 'goforbarney' });

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody).toMatchObject(updatedUser);
    });

    test('Should response with an error message when requested user ID does not exist', async () => {
      const response = await request(server)
        .put(`/api/users/${notExistingUserId}`)
        .set('Cookie', authCookie);

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(401);
      expect(responseBody.message).toBe(
        'Unauthorized to modify the requested user'
      );
    });

    test('Should response with an error message when requested user ID is not valid', async () => {
      const response = await request(server)
        .put(`/api/users/${invalidId}`)
        .set('Cookie', authCookie);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(401);
      expect(responseBody.message).toBe(
        'Unauthorized to modify the requested user'
      );
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('Should delete the correct user from the database', async () => {
      const signInResponse = await request(server)
        .post(`/api/auth/signin`)
        .set('Content-Type', 'application/json')
        .send({
          email: newValidUser.email,
          password: newValidUser.password,
        });

      [authCookie] = signInResponse.headers['set-cookie'];

      const response = await request(server)
        .delete(`/api/users/${userId}`)
        .set('Cookie', authCookie);
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
      const response = await request(server)
        .delete(`/api/users/${invalidId}`)
        .set('Cookie', authCookie);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(401);
      expect(responseBody.message).toBe(
        'Unauthorized to modify the requested user'
      );
    });

    test('Should response with an error message when requested user ID does not exist', async () => {
      const response = await request(server)
        .delete(`/api/users/${notExistingUserId}`)
        .set('Cookie', authCookie);

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(401);
      expect(responseBody.message).toBe(
        'Unauthorized to modify the requested user'
      );
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

      const signInResponse = await request(server)
        .post(`/api/auth/signin`)
        .set('Content-Type', 'application/json')
        .send({
          username: donatorUser.username,
          password: donatorUser.password,
        });

      [authCookie] = signInResponse.headers['set-cookie'];
      // Following endpoint is called to set isDonator field to true
      await request(server)
        .put(`/api/users/${userIdDonator}`)
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ isDonator: true });

      const res = await request(server).get('/api/global/donators');

      expect(res.header['content-type']).toContain('application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toMatchObject(expectedDonatorResponse);
    });
  });

  describe('POST /api/users/:userid/rating', () => {
    test('Should create a new rating if it does not exist', async () => {
      const res = await request(server).get(`/api/users/`);
      toBeRatedUserId = res.body[1]._id;
      const response = await request(server)
        .post(`/api/users/${toBeRatedUserId}/rating`)
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ rating: 5 });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(201);
      expect(response.body.averageRating).toBe(5);
      expect(response.body.raters[0].rating).toBe(5);
    });

    test('Should add a new rating to the existing one and calculate average rating', async () => {
      // Below sign up and sign in for a new user is implemented to add a new a rating
      await request(server)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(newValidUser2);

      const signInResponse = await request(server)
        .post(`/api/auth/signin`)
        .set('Content-Type', 'application/json')
        .send({
          email: newValidUser2.email,
          password: newValidUser2.password,
        });

      [newAuthCookie] = signInResponse.headers['set-cookie'];

      const response = await request(server)
        .post(`/api/users/${toBeRatedUserId}/rating`)
        .set('Content-Type', 'application/json')
        .set('Cookie', newAuthCookie)
        .send({ rating: 3 });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(201);
      expect(response.body.raters.length).toBe(2);
      expect(response.body.averageRating).toBe(4);
      expect(response.body.raters[1].rating).toBe(3);
    });

    test('Should response with an error message when requested user ID does not exist', async () => {
      const response = await request(server)
        .post(`/api/users/${notExistingUserId}/rating`)
        .set('Cookie', newAuthCookie);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        "The user with the specified ID wasn't found"
      );
    });

    test('Should response with an error message when requested user ID is not valid', async () => {
      const response = await request(server)
        .post(`/api/users/${invalidId}/rating`)
        .set('Cookie', newAuthCookie);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('Requested user ID is not valid!');
    });

    test('Should response with an error message if the user is not authenticated', async () => {
      const response = await request(server)
        .post(`/api/users/${toBeRatedUserId}/rating`)
        .set('Content-Type', 'application/json')
        .send({ rating: 3 });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('You are not authenticated');
    });

    test('Should response with an error message if the rater already rated user before', async () => {
      const response = await request(server)
        .post(`/api/users/${toBeRatedUserId}/rating`)
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ rating: 3 });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBe('You had already rated this user');
    });
  });

  describe('PUT /api/users/:userid/rating', () => {
    test('Should update a rating if the rater have rated before that user', async () => {
      const response = await request(server)
        .put(`/api/users/${toBeRatedUserId}/rating`)
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ rating: 1 });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body.averageRating).toBe(2);
      expect(response.body.raters[0].rating).toBe(1);
    });

    test('Should response with an error message when requested user ID does not exist', async () => {
      const response = await request(server)
        .put(`/api/users/${notExistingUserId}/rating`)
        .set('Cookie', newAuthCookie);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        "The user with the specified ID wasn't found"
      );
    });

    test('Should response with an error message when requested user ID is not valid', async () => {
      const response = await request(server)
        .put(`/api/users/${invalidId}/rating`)
        .set('Cookie', newAuthCookie);
      const responseBody = response.body;
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('Requested user ID is not valid!');
    });

    test('Should response with an error message if the user does not have any rating', async () => {
      const response = await request(server)
        .put(`/api/users/${userIdDonator}/rating`)
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ rating: 4 });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBe('The user does not have any rating');
    });

    test('Should response with an error message if the user is not authenticated', async () => {
      const response = await request(server)
        .put(`/api/users/${toBeRatedUserId}/rating`)
        .set('Content-Type', 'application/json')
        .send({ rating: 4 });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('You are not authenticated');
    });

    test('Should response with an error message if the rater is trying to update a rating before even adding any rate', async () => {
      // Below sign up and sign in for a new user is implemented to add a new a rating
      await request(server)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(newValidUser3);

      const signInResponse = await request(server)
        .post(`/api/auth/signin`)
        .set('Content-Type', 'application/json')
        .send({
          email: newValidUser3.email,
          password: newValidUser3.password,
        });

      const response = await request(server)
        .put(`/api/users/${toBeRatedUserId}/rating`)
        .set('Content-Type', 'application/json')
        .set('Cookie', signInResponse.headers['set-cookie'])
        .send({ rating: 3 });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBe('You do not have a rating to update');
    });
  });
});
