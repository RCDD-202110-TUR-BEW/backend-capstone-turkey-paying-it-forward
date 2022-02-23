const request = require('supertest');
const server = require('../../app');
const { closeDatabase, clearDatabase } = require('../../db/connection');

let ownerId;
let authCookie;
let RequestId;
const nonExistingRequestId = '5e9f8f9b9b8f8e0e8c8b4567';
const invalidRequestId = 'invalidId123';
const trueRequest = {
  name: 'Sofa',
  description: 'A comfortable and medium size sofa',
  owner: ownerId,
  type: 'Stationery',
};
const trueRequest2 = {
  name: 'Sofa2',
  description: 'A comfortable and medium size sofa',
  owner: ownerId,
  type: 'Stationery',
};
const invalidTypeRequest = {
  name: 'Sofa',
  description: 'A comfortable and medium size sofa',
  type: 'invalid',
};
const noNameRequest = {
  description: 'A comfortable and medium size sofa',
  owner: ownerId,
  type: 'Stationery',
};
const noDescriptionRequest = {
  name: 'Sofa',
  owner: ownerId,
  type: 'Stationery',
};
const mockUser = {
  username: 'mock.user',
  firstName: 'mock',
  lastName: 'user',
  email: 'mockuser@gmail.com',
  password: 'Password1234',
  passwordConfirm: 'Password1234',
  address: 'Central Perk, New York',
  acceptTerms: true,
};

describe('Request Endpoints', () => {
  beforeAll(async () => {
    await clearDatabase();
    const signUpResponse = await request(server)
      .post('/api/auth/signup')
      .set('Content-Type', 'application/json')
      .send(mockUser);
    ownerId = signUpResponse.body._id;
    trueRequest.owner = ownerId;
    trueRequest2.owner = ownerId;
    noNameRequest.owner = ownerId;
    noDescriptionRequest.owner = ownerId;
    const signInResponse = await request(server)
      .post(`/api/auth/signin`)
      .set('Content-Type', 'application/json')
      .send({ username: mockUser.username, password: mockUser.password });
    [authCookie] = signInResponse.headers['set-cookie'];
  });

  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
    server.close();
  });

  describe('GET /api/requests/', () => {
    test('Should response with an error message when there are no requests', async () => {
      await clearDatabase();
      const response = await request(server).get('/api/requests/');

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBe('No requests found');
    });

    test('Should return all requests', async () => {
      await request(server)
        .post('/api/requests/')
        .set('Cookie', authCookie)
        .send(trueRequest);
      await request(server)
        .post('/api/requests/')
        .set('Cookie', authCookie)
        .send(trueRequest2);

      const response = await request(server).get('/api/requests/');
      const responseBody = response.body;
      RequestId = responseBody[0]._id;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.status).toBe(200);
      expect(responseBody.length).toBe(2);
      expect(responseBody[0]).toMatchObject(trueRequest);
      expect(responseBody[1]).toMatchObject(trueRequest2);
    });
  });

  describe('POST /api/requests/', () => {
    test('Should create a new request when all provided inputs are valid', async () => {
      const response = await request(server)
        .post('/api/requests/')
        .set('Cookie', authCookie)
        .send(trueRequest);
      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.status).toBe(201);
      expect(responseBody.message).toBe('Request created successfully');
    });

    test('Should not create a new request when type is not valid', async () => {
      const response = await request(server)
        .post('/api/requests/')
        .set('Cookie', authCookie)
        .send(invalidTypeRequest);
      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBeDefined();
      expect(responseBody.message).toContain(
        "Request type should be any one of 'Books', 'Stationery', 'School Books', 'Novels', 'Test Books' or 'Furniture'"
      );
    });

    test('Should not create a new request when name is not provided', async () => {
      const response = await request(server)
        .post('/api/requests/')
        .set('Cookie', authCookie)
        .send(noNameRequest);
      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBeDefined();
      expect(responseBody.message).toContain('Request name is required');
    });

    test('Should not create a new request when description is not provided', async () => {
      const response = await request(server)
        .post('/api/requests/')
        .set('Cookie', authCookie)
        .send(noDescriptionRequest);
      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBeDefined();
      expect(responseBody.message).toContain('Description is required');
    });
  });

  describe('GET /api/requests/:id', () => {
    test('Should send the correct request in the response', async () => {
      const response = await request(server).get(`/api/requests/${RequestId}`);
      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody).toMatchObject(trueRequest);
      expect(responseBody._id.toString()).toBe(RequestId.toString());
    });

    test('Should respond with error message when the request id is not a valid ObjectId', async () => {
      const response = await request(server).get(
        `/api/requests/${invalidRequestId}`
      );
      const responseBody = response.body;

      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('Requested request ID is not valid!');
    });

    test('Should return an error message when the request does not exist', async () => {
      const response = await request(server).get(
        `/api/requests/${nonExistingRequestId}`
      );
      const responseBody = response.body;

      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        'There is no request with the provided ID!'
      );
    });
  });
});
