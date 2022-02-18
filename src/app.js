const express = require('express');

require('dotenv').config();

const cookieParser = require('cookie-parser');
const { connectToMongo } = require('./db/connection');

const authRoutes = require('./routers/auth');

const itemRoutes = require('./routers/item');

const userRoutes = require('./routers/user');

const globalRoutes = require('./routers/global');

const app = express();
const port = process.env.NODE_LOCAL_PORT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get('/status', (req, res) => {
  res.send('OK');
});
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/global', globalRoutes);

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  connectToMongo();
});

module.exports = server;
