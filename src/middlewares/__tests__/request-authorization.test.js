const requestAuthorization = require('../request-authorization');
const Request = require('../../models/request');

const trueOwnerId = '123456';
const falseOwnerId = '654321';
const correctRequestId = 'correctId';
const incorrectRequestId = 'incorrectId';
const request = {
  _id: 'correctId',
  owner: '123456',
};
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};
jest.mock('../../models/request', () => ({
  findById: jest.fn().mockImplementation((id) => {
    if (id === request._id) {
      return Promise.resolve(request);
    }
    return Promise.resolve(null);
  }),
}));
afterAll(() => {
  jest.clearAllMocks();
});
describe('request-authorization function middleware ', () => {
  test('Should authorize when requesting user is the owner of request', async () => {
    const req = {
      params: {
        id: correctRequestId,
      },
      user: {
        _id: trueOwnerId,
      },
    };

    const next = jest.fn();
    await requestAuthorization(req, res, next);
    expect(Request.findById).toHaveBeenCalled();
    expect(Request.findById).toHaveBeenCalledWith(correctRequestId);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('Should unauthorize when requesting user is not the owner of request', async () => {
    const req = {
      params: {
        id: correctRequestId,
      },
      user: {
        _id: falseOwnerId,
      },
    };
    const next = jest.fn();

    await requestAuthorization(req, res, next);
    expect(Request.findById).toHaveBeenCalled();
    expect(Request.findById).toHaveBeenCalledWith(correctRequestId);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'unauthorized to modify the requested request',
    });
  });

  test('Should unauthorize when request does not exist', async () => {
    const req = {
      params: {
        id: incorrectRequestId,
      },
      user: {
        _id: trueOwnerId,
      },
    };
    const next = jest.fn();

    await requestAuthorization(req, res, next);
    expect(Request.findById).toHaveBeenCalled();
    expect(Request.findById).toHaveBeenCalledWith(incorrectRequestId);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message: 'The request with the specified ID was not found.',
    });
  });

  test('Should unauthorize when user ID is not provided', async () => {
    const req = {
      params: {
        id: correctRequestId,
      },
    };
    const next = jest.fn();

    await requestAuthorization(req, res, next);
    expect(Request.findById).toHaveBeenCalledWith(correctRequestId);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'unauthorized to modify the requested request',
    });
  });
});
