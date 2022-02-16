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
  passwordConfirm: 'password1234',
  address: 'Central Perk, New York',
  acceptTerms: true,
};

const correctUserWithUsername = {
  username: 'chandler.bing',
  password: 'password1234',
};

const correctUserWithEmail = {
  email: 'chandlerbing@gmail.com',
  password: 'password1234',
};

const userWithPasswordsNotMatching = {
  username: 'joey.tribbiani',
  firstName: 'Joey',
  lastName: 'Tribbiani',
  email: 'joeyribbiani@gmail.com',
  password: 'password1234',
  passwordConfirm: 'password123',
  address: 'Central Perk, New York',
  acceptTerms: true,
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
      expect(res.body).toBeDefined();
      expect(res.body.firstName).toBe(mockUser.firstName);

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
      const validHashedPassword =
        user && (await bcrypt.compare(mockUser.password, user.password_hash));
      expect(validHashedPassword).toBe(true);
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
        .send(userWithPasswordsNotMatching);
      expect(res.header.location).toBe(undefined);
      expect(res.statusCode).toBe(422);
      expect(res.text).toMatch(/passwords do not match/i);
    });
  });

  describe('POST /api/auth/signin', () => {
    test('Should sign in user with correct username and password', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send(correctUserWithUsername);
      expect(res.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(res.statusCode).toBe(200);
      expect(res.text).toMatch(/successfully signed in/i);
    });

    test('Should sign in user with correct email and password', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send(correctUserWithEmail);
      expect(res.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(res.statusCode).toBe(200);
      expect(res.text).toMatch(/successfully signed in/i);
    });

    test('Should throw an error if the user is trying to sign with wrong username or email', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send(userWithWrongUsername);
      expect(res.header.location).toBe(undefined);
      expect(res.statusCode).toBe(422);
      expect(res.text).toMatch(/wrong username or email/i);
    });

    test('Should throw an error if the user is trying to sign in with wrong password', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send(userWithWrongPassword);
      expect(res.header.location).toBe(undefined);
      expect(res.statusCode).toBe(422);
      expect(res.text).toMatch(/wrong password/i);
    });

    test('Should return valid token after sign in', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      jwt.sign = jest.fn().mockReturnValueOnce(token);
      bcrypt.compare = jest.fn().mockReturnValue(true);
      const spyOnCompare = jest.spyOn(bcrypt, 'compare');
      const spyOnSign = jest.spyOn(jwt, 'sign');
      const res = await request(server)
        .post('/api/auth/signin')
        .send(correctUserWithUsername)
        .set('Authorization', `Bearer ${token}`);

      const tokenExpiryDate = new Date();
      tokenExpiryDate.setDate(tokenExpiryDate.getDate() + 1);
      const expectedTokenArray = [
        `token=${token}; Max-Age=86400; Path=/; Expires=${tokenExpiryDate.toGMTString()}; HttpOnly`,
      ];
      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toEqual(expectedTokenArray);
      expect(spyOnCompare).toHaveBeenCalledTimes(1);
      expect(spyOnCompare).toHaveBeenCalledWith(
        'password1234',
        expect.anything()
      );
      expect(spyOnSign).toHaveBeenCalledTimes(1);
      expect(spyOnCompare).toHaveBeenCalledWith(
        'password1234',
        expect.anything()
      );
    });
  });

  describe('GET /api/auth/signout', () => {
    const expectedClearedCookieInfo =
      '_t=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    test('Should sign out and clear the auth cookie', async () => {
      const res = await request(server).get('/api/auth/signout').send({});
      expect(res.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie'][0]).toEqual(expectedClearedCookieInfo);
    });
  });
});
