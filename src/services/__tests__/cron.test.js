const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();
const connection = require('../../db/connection');
const User = require('../../models/user');
const Item = require('../../models/item');
const { checkServerStatusJob, newsletterJob } = require('../cron');
const mail = require('../mail');
const logger = require('../logger');

jest.mock('../../db/connection', () => ({
  connectToMongo: jest.fn(),
  closeDatabase: jest.fn(),
}));
jest.mock('../../models/item', () => ({
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn(),
}));
jest.mock('../mail');

const spyOnLimitItem = jest.spyOn(Item, 'limit');
const spyOnFindUser = jest.spyOn(User, 'find');
const spyOnSchedule = jest.spyOn(cron, 'schedule');
const spyOnAxiosGet = jest.spyOn(axios, 'get');
const spyOnLoggerInfo = jest.spyOn(logger, 'info');
const spyOnLoggerError = jest.spyOn(logger, 'error');

spyOnSchedule.mockImplementation(
  // eslint-disable-next-line no-return-await
  async (frequency, callback) => await callback()
);

afterAll(() => {
  jest.restoreAllMocks();
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('cron jobs service', () => {
  describe('server status job', () => {
    test('Should log server is up when server is working', async () => {
      spyOnAxiosGet.mockImplementation(() => Promise.resolve());

      await checkServerStatusJob();
      expect(spyOnSchedule).toHaveBeenCalled();
      expect(spyOnSchedule).toHaveBeenCalledTimes(1);
      expect(spyOnSchedule).toHaveBeenCalledWith(
        process.env.SERVER_STATUS_CRON_JOB_SCHEDULE,
        expect.any(Function),
        {
          scheduled: true,
          timezone: 'Europe/Istanbul',
        }
      );
      expect(spyOnAxiosGet).toHaveBeenCalled();
      expect(spyOnAxiosGet).not.toThrow();
      expect(spyOnAxiosGet).toHaveBeenCalledWith(
        `${process.env.SERVER_BASE_URL}/status`
      );
      expect(spyOnLoggerInfo).toHaveBeenCalled();
      expect(spyOnLoggerInfo).toBeCalledTimes(1);
      expect(spyOnLoggerInfo).toBeCalledWith('Server is up');
    });

    test('Should log server is down when server is not working', async () => {
      spyOnAxiosGet.mockImplementation(() => {
        throw new Error('Server is down');
      });

      await checkServerStatusJob();
      expect(spyOnSchedule).toHaveBeenCalled();
      expect(spyOnSchedule).toHaveBeenCalledTimes(1);
      expect(spyOnSchedule).toHaveBeenCalledWith(
        process.env.SERVER_STATUS_CRON_JOB_SCHEDULE,
        expect.any(Function),
        {
          scheduled: true,
          timezone: 'Europe/Istanbul',
        }
      );
      expect(spyOnAxiosGet).toHaveBeenCalled();
      expect(spyOnAxiosGet).toThrow();
      expect(spyOnAxiosGet).toHaveBeenCalledWith(
        `${process.env.SERVER_BASE_URL}/status`
      );
      expect(spyOnLoggerError).toHaveBeenCalled();
      expect(spyOnLoggerError).toBeCalledTimes(1);
      expect(spyOnLoggerError).toBeCalledWith('Server is down');
    });
  });
  describe('news letter job', () => {
    test('Should send email to users when there are available items', async () => {
      spyOnLimitItem.mockImplementation(() =>
        Promise.resolve([
          {
            _id: '5e9f8f9f9f9f9f9f9f9f9f9',
            name: 'item1',
          },
        ])
      );
      spyOnFindUser.mockImplementation(() =>
        Promise.resolve([
          {
            _id: '5e9f8f9f9f9f9f9f9f9f9f9',
            email: ' ',
          },
        ])
      );

      await newsletterJob();
      expect(spyOnSchedule).toHaveBeenCalled();
      expect(spyOnSchedule).toHaveBeenCalledTimes(1);
      expect(spyOnSchedule).toHaveBeenCalledWith(
        process.env.NEWSLETTER_CRON_JOB_SCHEDULE,
        expect.any(Function),
        {
          scheduled: true,
          timezone: 'Europe/Istanbul',
        }
      );
      expect(connection.connectToMongo).toHaveBeenCalled();
      expect(connection.connectToMongo).toHaveBeenCalledTimes(1);
      expect(Item.find).toHaveBeenCalled();
      expect(Item.find).toHaveBeenCalledTimes(1);
      expect(Item.find).toHaveBeenCalledWith({ isAvailable: true });
      expect(Item.sort).toHaveBeenCalledTimes(1);
      expect(Item.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(spyOnLimitItem).toHaveBeenCalledTimes(1);
      expect(spyOnLimitItem).toHaveBeenCalledWith(10);
      expect(spyOnFindUser).toHaveBeenCalled();
      expect(spyOnFindUser).toHaveBeenCalledTimes(1);
      expect(spyOnFindUser).toHaveBeenCalledWith({}, { _id: 0, email: 1 });
      expect(mail.sendEmail).toHaveBeenCalled();
      expect(mail.sendEmail).toBeCalledTimes(1);
      expect(mail.sendEmail).toBeCalledWith(expect.any(Object));
      expect(connection.closeDatabase).toHaveBeenCalled();
      expect(connection.closeDatabase).toHaveBeenCalledTimes(1);
    });

    test('Should not send email to users when there are no available items', async () => {
      spyOnLimitItem.mockImplementation(() => Promise.resolve([]));
      spyOnFindUser.mockImplementation(() =>
        Promise.resolve([
          {
            _id: '5e9f8f9f9f9f9f9f9f9f9f9',
            email: 'mockedmail@mail.com ',
          },
        ])
      );

      await newsletterJob();
      expect(spyOnSchedule).toHaveBeenCalled();
      expect(spyOnSchedule).toHaveBeenCalledTimes(1);
      expect(spyOnSchedule).toHaveBeenCalledWith(
        process.env.NEWSLETTER_CRON_JOB_SCHEDULE,
        expect.any(Function),
        {
          scheduled: true,
          timezone: 'Europe/Istanbul',
        }
      );
      expect(connection.connectToMongo).toHaveBeenCalled();
      expect(connection.connectToMongo).toHaveBeenCalledTimes(1);
      expect(Item.find).toHaveBeenCalled();
      expect(Item.find).toHaveBeenCalledTimes(1);
      expect(Item.find).toHaveBeenCalledWith({ isAvailable: true });
      expect(Item.sort).toHaveBeenCalledTimes(1);
      expect(Item.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(spyOnLimitItem).toHaveBeenCalledTimes(1);
      expect(spyOnLimitItem).toHaveBeenCalledWith(10);
      expect(spyOnFindUser).toHaveBeenCalled();
      expect(spyOnFindUser).toHaveBeenCalledTimes(1);
      expect(spyOnFindUser).toHaveBeenCalledWith({}, { _id: 0, email: 1 });
      expect(mail.sendEmail).not.toHaveBeenCalled();
      expect(spyOnLoggerError).toHaveBeenCalledTimes(1);
      expect(spyOnLoggerError).toHaveBeenCalledWith(
        'No available items or users for newsletter'
      );
      expect(connection.closeDatabase).toHaveBeenCalled();
      expect(connection.closeDatabase).toHaveBeenCalledTimes(1);
    });

    test('Should not send email when there are no users', async () => {
      spyOnLimitItem.mockImplementation(() =>
        Promise.resolve([
          {
            _id: '5e9f8f9f9f9f9f9f9f9f9f9',
            name: 'item1',
          },
        ])
      );
      spyOnFindUser.mockImplementation(() => Promise.resolve([]));

      await newsletterJob();
      expect(spyOnSchedule).toHaveBeenCalled();
      expect(spyOnSchedule).toHaveBeenCalledTimes(1);
      expect(spyOnSchedule).toHaveBeenCalledWith(
        process.env.NEWSLETTER_CRON_JOB_SCHEDULE,
        expect.any(Function),
        {
          scheduled: true,
          timezone: 'Europe/Istanbul',
        }
      );
      expect(connection.connectToMongo).toHaveBeenCalled();
      expect(connection.connectToMongo).toHaveBeenCalledTimes(1);
      expect(Item.find).toHaveBeenCalled();
      expect(Item.find).toHaveBeenCalledTimes(1);
      expect(Item.find).toHaveBeenCalledWith({ isAvailable: true });
      expect(Item.sort).toHaveBeenCalledTimes(1);
      expect(Item.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(spyOnLimitItem).toHaveBeenCalledTimes(1);
      expect(spyOnLimitItem).toHaveBeenCalledWith(10);
      expect(spyOnFindUser).toHaveBeenCalled();
      expect(spyOnFindUser).toHaveBeenCalledTimes(1);
      expect(spyOnFindUser).toHaveBeenCalledWith({}, { _id: 0, email: 1 });
      expect(mail.sendEmail).not.toHaveBeenCalled();
      expect(spyOnLoggerError).toHaveBeenCalledTimes(1);
      expect(spyOnLoggerError).toHaveBeenCalledWith(
        'No available items or users for newsletter'
      );
      expect(connection.closeDatabase).toHaveBeenCalled();
      expect(connection.closeDatabase).toHaveBeenCalledTimes(1);
    });
  });
});
