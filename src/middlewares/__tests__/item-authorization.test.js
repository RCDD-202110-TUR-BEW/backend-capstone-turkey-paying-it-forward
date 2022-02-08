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
    // eslint-disable-next-line no-underscore-dangle
    if (id === item._id) {
      return Promise.resolve(item);
    }
    return Promise.resolve(null);
  }),
}));

afterAll(() => {
  jest.clearAllMocks();
});
describe('itemAuthorization function middleware ', () => {
  it('should authorize user when his id equals to item owner id', async () => {
    const req = {
      params: {
        id: correctItemId,
      },
      user: {
        _id: trueOwnerId,
      },
    };

    const next = jest.fn().mockReturnThis();
    await itemAuthorization(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(Item.findById).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should unauthorize user when his id not equal to item owner id', async () => {
    const req = {
      params: {
        id: correctItemId,
      },
      user: {
        _id: falseOwnerId,
      },
    };
    const next = jest.fn().mockReturnThis();

    await itemAuthorization(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(Item.findById).toHaveBeenCalled();
    expect(Item.findById).toHaveBeenCalledWith(correctItemId);
    expect(res.status).toHaveBeenCalled();
  });

  it('should unauthorize user when item is not found', async () => {
    const req = {
      params: {
        id: incorrectItemId,
      },
      user: {
        _id: trueOwnerId,
      },
    };
    const next = jest.fn().mockReturnThis();

    await itemAuthorization(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(Item.findById).toHaveBeenCalled();
    expect(Item.findById).toHaveBeenCalledWith(incorrectItemId);
    expect(res.status).toHaveBeenCalled();
  });

  it('should unauthorize user when user is undefined', async () => {
    const req = {
      params: {
        id: correctItemId,
      },
    };
    const next = jest.fn().mockReturnThis();
    await itemAuthorization(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(Item.findById).toHaveBeenCalledWith(correctItemId);
  });
});
