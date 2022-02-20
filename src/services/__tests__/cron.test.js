const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();
const connection = require('../../db/connection');
const User = require('../../models/user');
const Item = require('../../models/item');
const { checkServerStatusJob, newsLetterJob } = require('../cron');
const mail = require('../mail');
const logger = require('../logger');

jest.mock('../../db/connection', () => ({
  connectToMongo: jest.fn(),
  closeDatabase: jest.fn(),
}));
jest.mock('../mail');

const spyOnFindItem = jest.spyOn(Item, 'find');
const spyOnFindUser = jest.spyOn(User, 'find');
const spyOnSchedule = jest.spyOn(cron, 'schedule');
const spyOnAxiosGet = jest.spyOn(axios, 'get');
const spyOnLoggerInfo = jest.spyOn(logger, 'info');
const spyOnLoggerError = jest.spyOn(logger, 'error');

afterAll(() => {
  jest.clearAllMocks();
});

describe('cron jobs service', () => {
  describe('server status job', () => {
    test('Should log server is up when server is working', async () => {
      spyOnAxiosGet.mockImplementation(() => Promise.resolve());
      spyOnSchedule.mockImplementation(
        // eslint-disable-next-line no-return-await
        async (frequency, callback) => await callback()
      );

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
        'http://localhost:3000/status'
      );
      expect(spyOnLoggerInfo).toHaveBeenCalled();
      expect(spyOnLoggerInfo).toBeCalledTimes(1);
      expect(spyOnLoggerInfo).toBeCalledWith('Server is up');

      spyOnAxiosGet.mockClear();
      spyOnSchedule.mockClear();
      spyOnLoggerInfo.mockClear();
    });
    test('Should log server is down when server is not working', async () => {
      spyOnAxiosGet.mockImplementation(() => {
        throw new Error('Server is down');
      });
      spyOnSchedule.mockImplementation(
        // eslint-disable-next-line no-return-await
        async (frequency, callback) => await callback()
      );

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
        'http://localhost:3000/status'
      );
      expect(spyOnLoggerError).toHaveBeenCalled();
      expect(spyOnLoggerError).toBeCalledTimes(1);
      expect(spyOnLoggerError).toBeCalledWith('Server is down');

      spyOnAxiosGet.mockRestore();
      spyOnSchedule.mockClear();
    });
  });
  describe('news letter job', () => {
    test('Should send email to users when there are available items', async () => {
      spyOnSchedule.mockImplementation(
        // eslint-disable-next-line no-return-await
        async (frequency, callback) => await callback()
      );

      spyOnFindItem.mockImplementation(() =>
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

      await newsLetterJob();
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
      expect(spyOnFindItem).toHaveBeenCalled();
      expect(spyOnFindItem).toHaveBeenCalledTimes(1);
      expect(spyOnFindItem).toHaveBeenCalledWith({ isAvailable: true });
      expect(spyOnFindUser).toHaveBeenCalled();
      expect(spyOnFindUser).toHaveBeenCalledTimes(1);
      expect(spyOnFindUser).toHaveBeenCalledWith();
      expect(mail.sendEmail).toHaveBeenCalled();
      expect(mail.sendEmail).toBeCalledTimes(1);
      expect(mail.sendEmail).toBeCalledWith(expect.any(Object));
      expect(connection.closeDatabase).toHaveBeenCalled();
      expect(connection.closeDatabase).toHaveBeenCalledTimes(1);
      spyOnSchedule.mockClear();
      spyOnFindItem.mockClear();
      spyOnFindUser.mockClear();
      mail.sendEmail.mockClear();
    });
    test('Should not send email to users when there are no available items', async () => {
      spyOnSchedule.mockImplementation(
        // eslint-disable-next-line no-return-await
        async (frequency, callback) => await callback()
      );

      spyOnFindItem.mockImplementation(() => Promise.resolve([]));
      spyOnFindUser.mockImplementation(() =>
        Promise.resolve([
          {
            _id: '5e9f8f9f9f9f9f9f9f9f9f9',
            email: ' ',
          },
        ])
      );

      await newsLetterJob();
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
      expect(connection.connectToMongo).toHaveBeenCalledTimes(2);
      expect(spyOnFindItem).toHaveBeenCalled();
      expect(spyOnFindItem).toHaveBeenCalledTimes(1);
      expect(spyOnFindItem).toHaveBeenCalledWith({ isAvailable: true });
      expect(spyOnFindUser).toHaveBeenCalled();
      expect(spyOnFindUser).toHaveBeenCalledTimes(1);
      expect(spyOnFindUser).toHaveBeenCalledWith();
      expect(mail.sendEmail).not.toHaveBeenCalled();
      expect(spyOnLoggerError).toHaveBeenCalledTimes(2);
      expect(spyOnLoggerError).toHaveBeenCalledWith('email not sent');
      expect(connection.closeDatabase).toHaveBeenCalled();
      expect(connection.closeDatabase).toHaveBeenCalledTimes(2);

      spyOnSchedule.mockClear();
      spyOnFindItem.mockClear();
      spyOnFindUser.mockClear();
      mail.sendEmail.mockClear();
    });
    test('Should not send email when there are no users', async () => {
      spyOnSchedule.mockImplementation(
        // eslint-disable-next-line no-return-await
        async (frequency, callback) => await callback()
      );

      spyOnFindItem.mockImplementation(() =>
        Promise.resolve([
          {
            _id: '5e9f8f9f9f9f9f9f9f9f9f9',
            name: 'item1',
          },
        ])
      );
      spyOnFindUser.mockImplementation(() => Promise.resolve([]));

      await newsLetterJob();
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
      expect(connection.connectToMongo).toHaveBeenCalledTimes(3);
      expect(spyOnFindItem).toHaveBeenCalled();
      expect(spyOnFindItem).toHaveBeenCalledTimes(1);
      expect(spyOnFindItem).toHaveBeenCalledWith({ isAvailable: true });
      expect(spyOnFindUser).toHaveBeenCalled();
      expect(spyOnFindUser).toHaveBeenCalledTimes(1);
      expect(spyOnFindUser).toHaveBeenCalledWith();
      expect(mail.sendEmail).not.toHaveBeenCalled();
      expect(spyOnLoggerError).toHaveBeenCalledTimes(3);
      expect(spyOnLoggerError).toHaveBeenCalledWith('email not sent');
      expect(connection.closeDatabase).toHaveBeenCalled();
      expect(connection.closeDatabase).toHaveBeenCalledTimes(3);
    });
  });
});
