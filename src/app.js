const express = require('express');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { connectToMongo } = require('./db/connection');
const authRoutes = require('./routers/auth');
const itemRoutes = require('./routers/item');
const userRoutes = require('./routers/user');
const globalRoutes = require('./routers/global');
const requestRoutes = require('./routers/request');

const logger = require('./services/logger');
const { googleConfigs, afterGoogleLogin } = require('./passport');

const app = express();
const port = process.env.NODE_LOCAL_PORT;

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

passport.use(new GoogleStrategy(googleConfigs, afterGoogleLogin));

app.use(passport.initialize());

app.get('/status', (req, res) => {
  res.send('OK');
});
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/global', globalRoutes);

const server = app.listen(port, () => {
  logger.log('info', `Server is running on port ${port}`);
  connectToMongo();
});

module.exports = server;
