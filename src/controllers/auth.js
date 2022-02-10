const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const saltRounds = 10;

const User = require('../models/user');

module.exports = {
  signInUser: async (req, res) => {
    res.json('');
  },

  // eslint-disable-next-line consistent-return
  signUpUser: async (req, res) => {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      password2,
      address,
      acceptTos,
    } = req.body;

    if (await User.exists({ username }))
      return res.status(400).send('Username already used');
    if (password !== password2)
      return res.status(400).send('passwords do not match');

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password_hash: passwordHash,
      acceptTos,
      address,
    });

    const payload = {
      username,
      email,
      exp: (Date.now() + 12096e5) / 1000,
      iat: Date.now() / 1000,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.cookie('token', token, {
      httpOnly: true,
    });
    res.json(user);
  },

  signOutUser: (req, res) => {
    res.json('');
  },
};
