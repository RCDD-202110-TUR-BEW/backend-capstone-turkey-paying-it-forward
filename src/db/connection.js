const mongoose = require('mongoose');
require('dotenv').config();

// Use a separate test db when running jest
const isJest = process.env.IS_JEST;
let url = process.env.DB_URL;
if (isJest) url = process.env.TEST_DB_URL;

const connectToMongo = () => {
  mongoose.connect(url, { useNewUrlParser: true });

  const db = mongoose.connection;

  db.once('open', () => {
    console.log('Database connected');
  });

  db.on('error', (err) => {
    console.error('Database connection error: ', err);
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
  /* eslint-disable no-restricted-syntax, guard-for-in, no-await-in-loop */
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

module.exports = { connectToMongo, closeDatabase, clearDatabase };
