const cron = require('node-cron');
const axios = require('axios');
const { sendEmail } = require('./mail');
require('dotenv').config();
const User = require('../models/user');
const Item = require('../models/item');
const logger = require('./logger');
const { connectToMongo, closeDatabase } = require('../db/connection');

function emailOptions(emails, availableItems) {
  return {
    from: process.env.EMAIL_USER,
    to: emails,
    subject: 'NewsLetter',
    html: ` <h1>Hi,</h1>
  <p>Here are the available items:</p>
  <ul>
    ${availableItems.map((item) => `<li>${item.name}</li>`).join('')}
  </ul>
  <p>Have a nice day!</p>
  <p>Best regards,</p>
  <p>Your friend,</p>
  <p>Paying it forward Team</p>`,
  };
}
// this job check the server status every hour
const checkServerStatusJob = () =>
  cron.schedule(
    process.env.SERVER_STATUS_CRON_JOB_SCHEDULE,
    async () => {
      try {
        await axios.get('http://localhost:3000/status');
        logger.info('Server is up');
      } catch (error) {
        logger.error('Server is down');
      }
    },
    {
      scheduled: true,
      timezone: 'Europe/Istanbul',
    }
  );
// this job send the newsletter to the users every week
const newsLetterJob = () =>
  cron.schedule(
    process.env.NEWSLETTER_CRON_JOB_SCHEDULE,
    async () => {
      try {
        connectToMongo();
        const numberOfItems = 10;
        const availableItems = await Item.find({ isAvailable: true })
          .sort({ createdAt: -1 })
          .limit(numberOfItems);
        const users = await User.find({}, { email: 1, _id: 0 });
        // check if there are no users or available items
        if (availableItems.length <= 0 || users.length <= 0)
          throw new Error('email not sent');

        const emails = users.map((user) => user.email);
        const Options = emailOptions(emails, availableItems);
        await sendEmail(Options);
      } catch (err) {
        logger.error(err.message ?? err);
      } finally {
        await closeDatabase();
      }
    },
    {
      scheduled: true,
      timezone: 'Europe/Istanbul',
    }
  );

module.exports = { checkServerStatusJob, newsLetterJob };
