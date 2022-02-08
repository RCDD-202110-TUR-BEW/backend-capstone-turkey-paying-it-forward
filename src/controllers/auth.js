const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const saltRounds = 10;

const User = require('../models/user');

module.exports = {
  signInUser: async (req, res) => {
    res.json('');
    /*
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Wrong username or password');

    bcrypt.compare(password, user.password_hash, function (err, result) {
      if (result) {
        const payload = {
          username: username,
          email: email,
          exp: (Date.now() + 12096e5) / 1000,
          iat: Date.now() / 1000,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.cookie('token', token, {
          httpOnly: true,
        });
        res.status(302).header('user', user.id).redirect('/user/authenticated');
      } else {
        res.status(400).send('Wrong username or password');
      }
    });
    */
  },
  // eslint-disable-next-line consistent-return
  signUpUser: async (req, res) => {
    // res.json('');

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
    await User.create({
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

    res.redirect('/user/authenticated');
  },
  signOutUser: (req, res) => {
    // res.json('');

    res.clearCookie('token');
  },
};
