const jwt = require('jsonwebtoken');
const userAuthentication = require('../user-authentication');

const validTokenWithValidTime = {
  tokenValue: 'validToken',
  expires: 'validTime',
};
const validTokenWithNoValidTime = {
  tokenValue: 'validToken',
  expires: 'invalidTime',
};
const invalidTokenWithValidTime = {
  tokenValue: 'invalidToken',
  expires: 'validTime',
};
const invalidTokenWithInvalidTime = {
  tokenValue: 'invalidToken',
  expires: 'invalidTime',
};
const mockUser = {
  id: 1,
  username: 'name',
  email: 'someemail@gmail.com',
};

jest.useFakeTimers();

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  clearCookie: jest.fn().mockReturnThis(),
};
const next = jest.fn();

const verify = jest.spyOn(jwt, 'verify');

afterAll(() => {
  jest.clearAllMocks();
});
describe('user-authentication function middleware', () => {
  test('Should authenticate for valid token with valid expiry time', () => {
    verify.mockImplementation(() => ({ user: mockUser }));
    const req = {
      cookies: {
        token: validTokenWithValidTime,
      },
    };

    userAuthentication(req, res, next);
    expect(req.user).toEqual(mockUser);
    expect(req.user.id).toEqual(mockUser.id);
    expect(verify).toHaveBeenCalled();
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith(
      validTokenWithValidTime,
      process.env.JWT_SECRET
    );
    expect(verify).not.toThrow();
    expect(verify).toHaveReturnedWith({ user: mockUser });
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('Should not authenticate for valid token with no valid expiry time', () => {
    verify.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = {
      cookies: {
        token: validTokenWithNoValidTime,
      },
    };

    userAuthentication(req, res, next);
    expect(req.user).toBeUndefined();
    expect(verify).toHaveBeenCalled();
    expect(verify).toHaveBeenCalledWith(
      validTokenWithNoValidTime,
      process.env.JWT_SECRET
    );
    expect(verify).toThrow();
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not authenticated',
    });
  });

  test('Should not authenticate for invalid token with valid expiry time', () => {
    verify.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = {
      cookies: {
        token: invalidTokenWithValidTime,
      },
    };

    userAuthentication(req, res, next);
    expect(verify).toThrow();
    expect(verify).toHaveBeenCalledWith(
      invalidTokenWithValidTime,
      process.env.JWT_SECRET
    );
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not authenticated',
    });
  });

  test('Should not authenticate for invalid token with no valid expiry time', () => {
    verify.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = {
      cookies: {
        token: invalidTokenWithInvalidTime,
      },
    };

    userAuthentication(req, res, next);
    expect(verify).toHaveBeenCalledWith(
      invalidTokenWithInvalidTime,
      process.env.JWT_SECRET
    );
    expect(verify).toThrow();
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not authenticated',
    });
  });

  test('Should not authenticate when no token is found', () => {
    verify.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = {
      cookies: {},
    };

    userAuthentication(req, res, next);
    expect(req.user).toBeUndefined();
    expect(verify).toThrow();
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not authenticated',
    });
  });
});
