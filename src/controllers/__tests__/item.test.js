const request = require('supertest');
const server = require('../../app');
const { closeDatabase, clearDatabase } = require('../../db/connection');

jest.setTimeout(10000);

let owner;
let borrowerId;
let authCookie;
let itemId;
let donateItemId;
const nonExistingItemId = '6208e47a5fe21cc475419234';
const invalidItemId = 'invalidId123';
const nonExistingUserId = '937c7f79bcf86ce7863f5d0a';

const trueItem = {
  name: 'Sofa',
  description: 'A comfortable and medium size sofa',
  owner,
  count: 2,
  photo:
    'https://st.depositphotos.com/1500766/2998/i/950/depositphotos_29982203-stock-photo-sofa-furniture-isolated-on-white.jpg',
  type: 'Stationery',
};

const trueItem2 = {
  name: 'Clean Code',
  description:
    "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
  owner,
  count: 2,
  photo:
    'https://m.media-amazon.com/images/S/aplus-media-library-service-media/ca64f05b-34e9-4cf1-8e42-3e8ae26001fc.__CR0,0,300,600_PT0_SX150_V1___.jpg',
  type: 'Books',
};

const trueItem3 = {
  name: 'My Sofa',
  description: 'Another Sofa',
  owner,
  count: 2,
  photo:
    'https://www.ulcdn.net/images/products/215114/original/Apollo_Sofa_Set_FNSF51APDU30000SAAAA_slide_00.jpg?1538973284',
  type: 'Stationery',
};

const trueItem4 = {
  name: 'My Sofa',
  description: 'Another Sofa',
  owner,
  count: 2,
  photo:
    'https://www.ulcdn.net/images/products/215114/original/Apollo_Sofa_Set_FNSF51APDU30000SAAAA_slide_00.jpg?1538973284',
  type: 'Stationery',
  isAvailable: false,
};

const invalidImageItem = {
  name: 'Sofa',
  description: 'A comfortable and medium size sofa',
  owner: '507f191e810c19729de860ea',
  count: 2,
  photo: 'https://docs.mongodb.com/manual/reference/method/ObjectId/',
  type: 'Stationery',
};

const invalidTypeItem = {
  name: 'Sofa',
  description: 'A comfortable and medium size sofa',
  owner: '507f191e810c19729de860ea',
  count: 2,
  photo:
    'https://st.depositphotos.com/1500766/2998/i/950/depositphotos_29982203-stock-photo-sofa-furniture-isolated-on-white.jpg',
  type: 'InvalidType',
};

const noNameItem = {
  description: 'A comfortable and medium size sofa',
  owner: '507f191e810c19729de860ea',
  count: 2,
  photo:
    'https://www.ulcdn.net/images/products/215114/original/Apollo_Sofa_Set_FNSF51APDU30000SAAAA_slide_00.jpg?1538973284',
  type: 'Stationery',
};

const noDescriptionItem = {
  name: 'Sofa',
  owner: '507f191e810c19729de860ea',
  count: 2,
  photo:
    'https://cdn11.bigcommerce.com/s-rt1rv/images/stencil/800x800/products/1248/4690/Metropolitan_Sofa__96991.1455228296.jpg?c=2',
  type: 'Stationery',
};

const availableItem = {
  name: 'chair',
  description: 'An ergonomic chair',
  owner,
  count: 3,
  photo:
    'https://st.depositphotos.com/1572973/1969/i/950/depositphotos_19690343-stock-photo-wooden-chair.jpg',
  type: 'Furniture',
  isAvailable: true,
};

const oneLeftItem = {
  name: 'chair',
  description: 'An ergonomic chair',
  owner,
  count: 1,
  photo:
    'https://st.depositphotos.com/1572973/1969/i/950/depositphotos_19690343-stock-photo-wooden-chair.jpg',
  type: 'Furniture',
  isAvailable: true,
};

const notAvailableItem = {
  name: 'chair',
  description: 'An ergonomic chair',
  owner,
  count: 2,
  photo:
    'https://st.depositphotos.com/1572973/1969/i/950/depositphotos_19690343-stock-photo-wooden-chair.jpg',
  type: 'Furniture',
  isAvailable: false,
};

const donatedItem = {
  name: 'chair',
  description: 'An ergonomic chair',
  owner,
  count: 2,
  photo:
    'https://st.depositphotos.com/1572973/1969/i/950/depositphotos_19690343-stock-photo-wooden-chair.jpg',
  type: 'Furniture',
  isAvailable: true,
  borrowers: [],
};

const mockUser = {
  username: 'chandler.bing',
  firstName: 'Chandler',
  lastName: 'Bing',
  email: 'chandlerbing@gmail.com',
  password: 'Password1234',
  passwordConfirm: 'Password1234',
  address: 'Central Perk, New York',
  acceptTerms: true,
};

const borrowerUser = {
  username: 'swarley',
  firstName: 'Barney',
  lastName: 'Stinson',
  email: 'barney.stinson@gmail.com',
  password: 'Password4321?',
  passwordConfirm: 'Password4321?',
  address: '3rd Avenue Manhattan',
  acceptTerms: true,
};

jest.setTimeout(30000);
beforeAll(async () => {
  await clearDatabase();
  /* 
    authCookie is needed to authenticate requests made to post, put, and delete items endpoints,
    without it, all the mentioned requests will not be able to pass the user-authentication middleware.
    And the reason for assigning all true items owners for the authenticated user is to make sure they
    pass the item-authorization middleware.
  */

  const signUpResponse = await request(server)
    .post('/api/auth/signup')
    .set('Content-Type', 'application/json')
    .send(mockUser);
  owner = signUpResponse.body;
  trueItem.owner = owner;
  trueItem2.owner = owner;
  trueItem3.owner = owner;
  trueItem4.owner = owner;
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

describe('Items Endpoints', () => {
  describe('GET /api/global/all-items', () => {
    test('Should send all items in the response, including not available ones', async () => {
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(trueItem);
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(trueItem2);
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(trueItem3);
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(trueItem4);

      const response = await request(server).get('/api/global/all-items');
      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody.length).toBe(4);
      expect(responseBody[0]).toMatchObject(trueItem);
      expect(responseBody[1]).toMatchObject(trueItem2);
      expect(responseBody[2]).toMatchObject(trueItem3);
      expect(responseBody[3]).toMatchObject(trueItem4);
    });

    test('Should response with an error message when there are no items', async () => {
      await clearDatabase();
      // Because we are clearing the database for this test, the owner is being removed from the database as well and
      // it is becoming undefined, so we have to signup the user and assign the item owner here again
      const signUpResponse = await request(server)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(mockUser);
      owner = signUpResponse.body;
      trueItem.owner = owner;
      trueItem2.owner = owner;
      trueItem3.owner = owner;
      trueItem4.owner = owner;
      const signInResponse = await request(server)
        .post(`/api/auth/signin`)
        .set('Content-Type', 'application/json')
        .send({ username: mockUser.username, password: mockUser.password });

      [authCookie] = signInResponse.headers['set-cookie'];

      const response = await request(server).get('/api/global/all-items');
      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBe('No items found');
    });
  });

  describe('GET /api/items/available', () => {
    test('Should response with an error message when there are no available items', async () => {
      const response = await request(server).get('/api/items/available');

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        'There are no available items at the moment!'
      );
    });

    test('Should send all available items in the response', async () => {
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(trueItem);
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(trueItem2);
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(trueItem3);

      const response = await request(server).get('/api/items/available');
      const responseBody = response.body;
      itemId = responseBody[0]._id;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody.length).toBe(3);
      expect(responseBody[0]).toMatchObject(trueItem);
      expect(responseBody[1]).toMatchObject(trueItem2);
      expect(responseBody[2]).toMatchObject(trueItem3);
    });
  });

  describe('GET /api/items/filter', () => {
    test('Should send only the items with the requested type', async () => {
      const response = await request(server).get(
        `/api/items/filter?type=Stationery`
      );

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody.length).toBe(2);
      expect(responseBody[0]).toMatchObject(trueItem);
      expect(responseBody[1]).toMatchObject(trueItem3);
    });

    test('Should response with an error message when there are no items of the requested type', async () => {
      const response = await request(server).get(
        `/api/items/filter?type=InvalidType`
      );

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBeDefined();
      expect(responseBody.message).toBe(
        'There are no available items of type InvalidType!'
      );
    });

    test('Should response with an error message when no type is provided', async () => {
      const response = await request(server).get(`/api/items/filter`);

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBeDefined();
      expect(responseBody.message).toBe('Type query parameter is required!');
    });
  });

  describe('POST /api/items', () => {
    test('Should create a new item when all provided inputs are valid', async () => {
      const response = await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(trueItem);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(trueItem);
    });

    test('Should not create a new item when image URL is invalid', async () => {
      const response = await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(invalidImageItem);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain(
        'Please enter a valid image URL!'
      );
    });

    test('Should not create a new item when type is not valid', async () => {
      const response = await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(invalidTypeItem);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain(
        "Item type should be any one of 'Books', 'Stationery', 'School Books', 'Novels', 'Test Books' or 'Furniture'"
      );
    });

    test('Should not create a new item when name is not provided', async () => {
      const response = await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(noNameItem);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('Item name is required');
    });

    test('Should not create a new item when description is not provided', async () => {
      const response = await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(noDescriptionItem);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('Description is required');
    });
  });

  describe('GET /api/items/:id', () => {
    test('Should send the correct item in the response', async () => {
      const response = await request(server).get(`/api/items/${itemId}`);

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(responseBody).toMatchObject(trueItem);
      expect(responseBody._id.toString()).toBe(itemId.toString());
    });

    test('Should response with an error message when requested item ID does not exist', async () => {
      const response = await request(server).get(
        `/api/items/${nonExistingItemId}`
      );

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe(
        'There is no item with the provided ID!'
      );
    });

    test('Should response with an error message when requested item ID is not valid', async () => {
      const response = await request(server).get(`/api/items/${invalidItemId}`);

      const responseBody = response.body;

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(responseBody.message).toBe('Requested item ID is not valid!');
    });
  });

  describe('PUT /api/items/:id', () => {
    test('Should update name on matching item', async () => {
      const response = await request(server)
        .put(`/api/items/${itemId}`)
        .set('Cookie', authCookie)
        .send({ name: 'Couch' });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toEqual('Couch');
    });

    test('Should set matching item as not available', async () => {
      const response = await request(server)
        .put(`/api/items/${itemId}`)
        .set('Cookie', authCookie)
        .send({ isAvailable: false });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body.isAvailable).toEqual(false);
    });

    test('Should response with an error message when to be updated item ID not found', async () => {
      const response = await request(server)
        .put(`/api/items/${nonExistingItemId}`)
        .set('Cookie', authCookie)
        .send({ isAvailable: false });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        'unauthorized to modify requested item: item not found'
      );
    });
  });

  describe('DELETE /api/items/:id', () => {
    test('Should delete matching item', async () => {
      const response = await request(server)
        .delete(`/api/items/${itemId}`)
        .set('Cookie', authCookie);

      expect(response.statusCode).toBe(204);
    });

    test('Should not find item after deleting it', async () => {
      const response = await request(server).get(`/api/items/${itemId}`);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBe(
        'There is no item with the provided ID!'
      );
    });

    test('Should throw an error if there is no item with the specified ID', async () => {
      const response = await request(server)
        .delete(`/api/items/${nonExistingItemId}`)
        .set('Cookie', authCookie);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        'unauthorized to modify requested item: item not found'
      );
    });
  });

  describe('PUT /api/items/donate', () => {
    beforeAll(async () => {
      await clearDatabase();
      // add a borrower user
      const borrowerRes = await request(server)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(borrowerUser);
      borrowerId = borrowerRes.body._id;

      const signUpResponse = await request(server)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(mockUser);
      owner = signUpResponse.body;

      availableItem.owner = owner;
      notAvailableItem.owner = owner;
      donatedItem.owner = owner;
      oneLeftItem.owner = owner;
      const signInResponse = await request(server)
        .post(`/api/auth/signin`)
        .set('Content-Type', 'application/json')
        .send({ username: mockUser.username, password: mockUser.password });

      [authCookie] = signInResponse.headers['set-cookie'];
    });

    test('Should donate the matching item to the matching borrower', async () => {
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(availableItem);
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(notAvailableItem);
      await request(server)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send(oneLeftItem);

      const itemRes = await request(server).get('/api/global/all-items');
      const responseBody = itemRes.body;
      donateItemId = responseBody[0]._id;

      const response = await request(server)
        .put('/api/items/donate')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ donateItemId, borrowerId });

      donatedItem.borrowers.push(borrowerId);

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(donatedItem);
    });

    test('Should response with an error message when requested item is not available', async () => {
      const itemRes = await request(server).get('/api/global/all-items');
      const responseBody = itemRes.body;
      donateItemId = responseBody[1]._id;

      const response = await request(server)
        .put('/api/items/donate')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ donateItemId, borrowerId });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBe(
        'The item with the specified ID is not available for donation.'
      );
    });

    test('Should response with an error message when requested item ID does not exist', async () => {
      const response = await request(server)
        .put('/api/items/donate')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ donateItemId: nonExistingItemId, borrowerId });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        'unauthorized to modify requested item: item not found'
      );
    });

    test('Should response with an error message when requested borrower ID does not exist', async () => {
      const response = await request(server)
        .put('/api/items/donate')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ donateItemId, borrowerId: nonExistingUserId });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(422);
      expect(response.body.message).toBe(
        'The borrower with the specified ID was not found.'
      );
    });

    test('Should set matching item as not available when the item count is 0', async () => {
      const itemRes = await request(server).get('/api/global/all-items');
      const responseBody = itemRes.body;
      donateItemId = responseBody[2]._id;
      const response = await request(server)
        .put('/api/items/donate')
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .send({ donateItemId, borrowerId });

      expect(response.header['content-type']).toContain('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body.isAvailable).toBe(false);
    });
  });
});
