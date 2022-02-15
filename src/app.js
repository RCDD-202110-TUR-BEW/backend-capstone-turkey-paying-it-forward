const path = require('path');

const express = require('express');

require('dotenv').config();

const { connectToMongo } = require('./db/connection');

const authRoutes = require('./routers/auth');

const itemRoutes = require('./routers/item');

const userRoutes = require('./routers/user');

const globalRoutes = require('./routers/global');

const logger = require('./services/logger');

const app = express();
const port = process.env.NODE_LOCAL_PORT;

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '/public')));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', (req, res) => {
  res.render('home');
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/global', globalRoutes);

const server = app.listen(port, () => {
  logger.log('info', `Server is running on port ${port}`);
  connectToMongo();
});

module.exports = server;
