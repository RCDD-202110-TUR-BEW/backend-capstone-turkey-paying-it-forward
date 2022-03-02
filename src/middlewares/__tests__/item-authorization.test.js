const itemAuthorization = require('../item-authorization');
const Item = require('../../models/item');

const trueOwnerId = '123456';
const falseOwnerId = '654321';
const correctItemId = 'correctId';
const incorrectItemId = 'incorrectId';
const item = {
  _id: 'correctId',
  owner: '123456',
};
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};
jest.mock('../../models/item', () => ({
  findById: jest.fn().mockImplementation((id) => {
    if (id === item._id) {
      return Promise.resolve(item);
    }
    return Promise.resolve(null);
  }),
}));

afterAll(() => {
  jest.clearAllMocks();
});

describe('item-authorization function middleware ', () => {
  test('Should authorize when requesting user is the owner of requested item', async () => {
    const req = {
      params: {
        id: correctItemId,
      },
      user: {
        _id: trueOwnerId,
      },
    };

    const next = jest.fn();
    await itemAuthorization(req, res, next);
    expect(Item.findById).toHaveBeenCalled();
    expect(Item.findById).toHaveBeenCalledWith(correctItemId);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('Should unauthorize when requesting user is not the owner of requested item', async () => {
    const req = {
      params: {
        id: correctItemId,
      },
      user: {
        _id: falseOwnerId,
      },
    };
    const next = jest.fn();

    await itemAuthorization(req, res, next);
    expect(Item.findById).toHaveBeenCalled();
    expect(Item.findById).toHaveBeenCalledWith(correctItemId);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message:
        'unauthorized to modify requested item: only item owner can modify',
    });
  });

  test("Should unauthorize when item doesn't exists", async () => {
    const req = {
      params: {
        id: incorrectItemId,
      },
      user: {
        _id: trueOwnerId,
      },
    };
    const next = jest.fn();

    await itemAuthorization(req, res, next);
    expect(Item.findById).toHaveBeenCalled();
    expect(Item.findById).toHaveBeenCalledWith(incorrectItemId);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'unauthorized to modify requested item: item not found',
    });
  });

  test('Should unauthorize when user ID is not provided', async () => {
    const req = {
      params: {
        id: correctItemId,
      },
    };
    const next = jest.fn();
    await itemAuthorization(req, res, next);
    expect(Item.findById).toHaveBeenCalledWith(correctItemId);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
