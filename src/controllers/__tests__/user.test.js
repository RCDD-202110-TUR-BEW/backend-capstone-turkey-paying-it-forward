const mockingoose = require('mockingoose');

const UserModel = require('../../models/user');

const { getAllDonators } = require('../user');

const users = [
  {
    _id: 'abc12345',
    username: 'Aisha',
    firstName: 'Aisha',
    lastName: 'Colins',
    email: 'aisha.colins@gmail.com',
    address: 'Green Avenue, Brooks Street, 25/5',
    password_hash: 'asdfghjkl',
    isDonator: true,
  },

  {
    _id: '56789abc',
    username: 'Lena',
    firstName: 'Lena',
    lastName: 'James',
    email: 'lena.james@gmail.com',
    address: 'Fox Avenue, Milburn Street, 10/31',
    password_hash: 'qwertyuiop',
    isDonator: true,
  },
];

let req;
let res;

describe('GET /api/global/donators', () => {
  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
    };
  });

  it('Should get information of all users, whose isDonator field is set to true.', async () => {
    mockingoose(UserModel).toReturn(users, 'find');
    const spyOnFind = jest.spyOn(UserModel, 'find');
    const fetchedUsers = await getAllDonators(req, res);
    for (let i = 0; i < users.length; i += 1) {
      expect(fetchedUsers[i].username).toBe(users[i].username);
      expect(fetchedUsers[i].email).toBe(users[i].email);
    }
    expect(spyOnFind).toHaveBeenCalledTimes(1);
  });

  it('Should throw an error if the database is empty', async () => {
    mockingoose(UserModel).toReturn([], 'find');
    const fetchedUsers = await getAllDonators(req, res);
    expect(fetchedUsers).toBe('There are no users in the database');
  });
});
