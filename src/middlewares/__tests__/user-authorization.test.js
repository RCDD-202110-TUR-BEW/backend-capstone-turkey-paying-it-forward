const userAuthorization = require('../user-authorization');

const incorrectUserId = 'IncorrectUserId';
const correctUserId = 'CorrectUserId';
const user = {
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
  it("Should authorize user when user's id equals to the passed param's id", () => {
    const req = {
      user,
      params: {
        id: correctUserId,
      },
    };
    const next = jest.fn().mockReturnThis();

    userAuthorization(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should unauthorize user when the passed param's id not equals to user's id ", () => {
    const req = {
      user,
      params: {
        id: incorrectUserId,
      },
    };
    const next = jest.fn().mockReturnThis();

    userAuthorization(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('should unauthorize user when user is not defined', () => {
    const req = {
      params: {
        id: 'anyId',
      },
    };
    const next = jest.fn().mockReturnThis();

    userAuthorization(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });
});
