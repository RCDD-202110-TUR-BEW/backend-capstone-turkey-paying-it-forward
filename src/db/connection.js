const mongoose = require('mongoose');
require('dotenv').config();

const logger = require('../services/logger');

// Use a separate test db when running jest
const isJest = process.env.IS_JEST;
let url = process.env.DB_URL;
if (isJest) url = process.env.TEST_DB_URL;

const connectToMongo = () => {
  mongoose.connect(url, { useNewUrlParser: true });

  const db = mongoose.connection;

  db.once('open', () => {
    logger.log('info', `Database connected to: ${url}`);
  });

  db.on('error', (err) => {
    logger.log('error', `Database connection error: ${err}`);
  });
};

// Use "closeDatabase(true)" in tests to clear test data.
const closeDatabase = async (drop = false) => {
  if (drop) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoose.connection.close();
};

const clearDatabase = async () => {
  const { collections } = mongoose.connection;
  const results = [];
  /* eslint-disable no-restricted-syntax, guard-for-in */
  for (const key in collections) {
    results.push(mongoose.connection.dropCollection(key));
  }
  await Promise.all(results);
};

module.exports = { connectToMongo, closeDatabase, clearDatabase };
