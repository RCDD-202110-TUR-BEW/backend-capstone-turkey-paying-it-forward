const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const swaggerDocument = require('./swagger.json');
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '/public')));

app.use(express.static(path.join(__dirname, '/assets')));
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

const options = {
  customCss: '.swagger-ui .topbar { display: none }',
};

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);
app.use('/', (req, res) => {
  res.render('home');
});

const server = app.listen(port, () => {
  logger.log('info', `Server is running on port ${port}`);
  connectToMongo();
});

module.exports = server;
