const express = require('express');

require('dotenv').config();

const cookieParser = require('cookie-parser');
const { connectToMongo } = require('./db/connection');

const authRoutes = require('./routers/auth');

const itemRoutes = require('./routers/item');

const userRoutes = require('./routers/user');

const globalRoutes = require('./routers/global');

const logger = require('./services/logger');

const app = express();
const port = process.env.NODE_LOCAL_PORT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/global', globalRoutes);

const server = app.listen(port, () => {
  logger.log('info', `Server is running on port ${port}`);
  connectToMongo();
});

module.exports = server;
