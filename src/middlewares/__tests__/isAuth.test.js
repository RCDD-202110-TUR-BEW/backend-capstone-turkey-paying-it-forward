const jwt = require('jsonwebtoken');
const isAuth = require('../isAuth');

const validToken = { tokenValue: 'validToken', expires: 'validTime' };
const validTokenWithNoValidTime = {
  tokenValue: 'invalidToken',
  expires: 'validTime',
};
const invalidToken = {
  tokenValue: 'invalidToken',
  expires: 'validTime',
};
const invalidTokenWithInvalidTime = {
  tokenValue: 'invalidToken',
  expires: 'invalidTime',
};
const user = {
  id: 1,
  username: 'name',
  email: 'someemail@gmail.com',
};

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  clearCookie: jest.fn().mockReturnThis(),
};
const next = jest.fn().mockReturnThis();

const verify = jest.spyOn(jwt, 'verify');

afterAll(() => {
  jest.clearAllMocks();
});
describe('isAuth function middleware', () => {
  it('Should verify when valid token and correct secret are passed', (done) => {
    verify.mockImplementation(() => user);
    const req = {
      cookies: {
        token: validToken,
      },
    };

    isAuth(req, res, next);
    expect(verify).toHaveBeenCalled();
    expect(verify).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
    expect(verify).not.toThrow();
    expect(verify).toHaveBeenCalledWith(validToken, process.env.JWT_SECRET);
    expect(verify).toHaveReturnedWith(user);
    done();
  });

  it('Should throw error when token time is expired', (done) => {
    verify.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = {
      cookies: {
        token: validTokenWithNoValidTime,
      },
    };

    isAuth(req, res, next);
    expect(verify).toHaveBeenCalled();
    expect(verify).toThrow();
    expect(verify).toHaveBeenCalledWith(
      validTokenWithNoValidTime,
      process.env.JWT_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not authenticated',
    });
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    done();
  });

  it('Should throw error when token is invalid and time is valid', (done) => {
    verify.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = {
      cookies: {
        token: invalidToken,
      },
    };

    isAuth(req, res, next);
    expect(verify).toThrow();
    expect(verify).toHaveBeenCalledWith(invalidToken, process.env.JWT_SECRET);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not authenticated',
    });
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    done();
  });

  it('Should throw error when token is invalid and time is invalid', (done) => {
    verify.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = {
      cookies: {
        token: invalidTokenWithInvalidTime,
      },
    };

    isAuth(req, res, next);
    expect(verify).toThrow();
    expect(verify).toHaveBeenCalledWith(
      invalidTokenWithInvalidTime,
      process.env.JWT_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not authenticated',
    });
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    done();
  });

  it('Should throw error when no token found in cookies', (done) => {
    verify.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = {
      cookies: {},
    };

    isAuth(req, res, next);
    expect(verify).toThrow();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not authenticated',
    });
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    done();
  });
});
