const mongoose = require('mongoose');

const request = require('supertest');

const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const server = require('../../app');

const {
  closeDatabase,
  clearDatabase,
  connectToMongo,
} = require('../../db/connection');

const mockUser = {
  username: 'chandler.bing',
  firstName: 'Chandler',
  lastName: 'Bing',
  email: 'chandlerbing@gmail.com',
  password: 'password1234',
  password2: 'password1234',
  address: 'Central Perk, New York',
  acceptTos: 'on',
};

const correctUser1 = {
  username: 'chandler.bing',
  password: 'password1234',
};

const correctUser2 = {
  email: 'chandlerbing@gmail.com',
  password: 'password1234',
};

const userWithWrongPassword2 = {
  username: 'joey.tribbiani',
  firstName: 'Joey',
  lastName: 'Tribbiani',
  email: 'joeyribbiani@gmail.com',
  password: 'password1234',
  password2: 'password123',
  address: 'Central Perk, New York',
  acceptTos: 'on',
};

const userWithWrongUsername = {
  username: 'chandler.bingg',
  password: 'password1234',
};

const userWithWrongPassword = {
  username: 'chandler.bing',
  password: 'passwrd1234',
};

beforeAll(async () => {
  connectToMongo();
});

afterAll(async () => {
  await closeDatabase();
  server.close();
});

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/signup', () => {
    test('Should sign up a new user', async () => {
      const res = await request(server).post('/api/auth/signup').send(mockUser);
      expect(res.statusCode).toBe(200);

      const user = await mongoose.connection
        .collection('users')
        .findOne({ username: mockUser.username });
      expect(user).toBeDefined();
      expect(user.username).toEqual(mockUser.username);
      expect(user.firstName).toEqual(mockUser.firstName);
      expect(user.lastName).toEqual(mockUser.lastName);
      expect(user.email).toEqual(mockUser.email);
      expect(user.address).toEqual(mockUser.address);
    });

    test('Should hash password with bcrypt', async () => {
      const user = await mongoose.connection
        .collection('users')
        .findOne({ username: mockUser.username });
      expect(user).toBeDefined();
      const valid =
        user && (await bcrypt.compare(mockUser.password, user.password_hash));
      expect(valid).toBe(true);
    });

    test('Should throw an error if the username is already used', async () => {
      const res = await request(server).post('/api/auth/signup').send(mockUser);
      expect(res.header.location).toBe(undefined);
      expect(res.statusCode).toBe(422);
      expect(res.text).toMatch(/username already used/i);
    });

    test('Should throw an error if the passwords do not match', async () => {
      const res = await request(server)
        .post('/api/auth/signup')
        .send(userWithWrongPassword2);
      expect(res.header.location).toBe(undefined);
      expect(res.statusCode).toBe(422);
      expect(res.text).toMatch(/passwords do not match/i);
    });
  });

  describe('POST /api/auth/signin', () => {
    test('Should sign in user with username and respond with status code 200', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send(correctUser1);
      expect(res.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(res.statusCode).toBe(200);
      expect(res.text).toMatch(/successfully signed in/i);
    });

    test('Should sign in user with email and respond with status code 200', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send(correctUser2);
      expect(res.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(res.statusCode).toBe(200);
      expect(res.text).toMatch(/successfully signed in/i);
    });

    test('Should throw an error if the user is trying to sign with wrong username', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send(userWithWrongUsername);
      expect(res.header.location).toBe(undefined);
      expect(res.statusCode).toBe(422);
      expect(res.text).toMatch(/wrong username/i);
    });

    test('Should throw an error if the user is trying to sign in with wrong password', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send(userWithWrongPassword);
      expect(res.header.location).toBe(undefined);
      expect(res.statusCode).toBe(422);
      expect(res.text).toMatch(/wrong password/i);
    });

    test('Should sign in and return token', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      jwt.sign = jest.fn().mockReturnValueOnce(token);
      bcrypt.compare = jest.fn().mockReturnValue(true);
      const spyOnCompare = jest.spyOn(bcrypt, 'compare');
      const spyOnSign = jest.spyOn(jwt, 'sign');
      const res = await request(server)
        .post('/api/auth/signin')
        .send(correctUser1)
        .set('Authorization', `Bearer ${token}`);

      const eat = new Date();
      eat.setDate(eat.getDate() + 1);
      const expectedTokenArray = [
        `token=${token}; Max-Age=86400; Path=/; Expires=${eat.toGMTString()}; HttpOnly`,
      ];
      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toEqual(expectedTokenArray);
      expect(spyOnCompare).toHaveBeenCalledTimes(1);
      expect(spyOnSign).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/auth/signout', () => {
    test('Should clear the auth cookie and respond with status code 200', async () => {
      const res = await request(server).get('/api/auth/signout');
      expect(res.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(res.statusCode).toBe(200);
    });
  });
});
