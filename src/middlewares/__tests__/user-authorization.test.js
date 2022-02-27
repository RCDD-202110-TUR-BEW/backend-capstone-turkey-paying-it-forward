const userAuthorization = require('../user-authorization');

const incorrectUserId = 'IncorrectUserId';
const correctUserId = 'CorrectUserId';

jest.useFakeTimers();

const mockUser = {
  _id: 'CorrectUserId',
  username: 'John',
  email: '123@gmail.com',
  password: '123456',
};
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

afterAll(() => {
  jest.resetAllMocks();
});
describe('user-authorization function middleware', () => {
  test('Should authorize user when trying to modify own information', () => {
    const req = {
      user: mockUser,
      params: {
        id: correctUserId,
      },
    };
    const next = jest.fn();

    userAuthorization(req, res, next);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('Should unauthorize user when trying to modify another user information', () => {
    const req = {
      user: mockUser,
      params: {
        id: incorrectUserId,
      },
    };
    const next = jest.fn();

    userAuthorization(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized to modify the requested user',
    });
  });

  test('Should unauthorize user when user ID is not found', () => {
    const req = {
      params: {
        id: 'anyId',
      },
    };
    const next = jest.fn();

    userAuthorization(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized to modify the requested user',
    });
  });
});
