const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const saltRounds = 10;

const User = require('../models/user');

module.exports = {
  signInUser: async (req, res) => {
    const { username, email, password, rememberMe } = req.body;
    let cookieAge = 24 * 3600;
    try {
      const user = await User.findOne({
        $or: [{ email: email }, { username: username }],
      });
      /* eslint object-shorthand: ["warn"] */
      if (!user) throw new Error('Wrong username');
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) throw new Error('Wrong password');

      const payload = {
        username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      if (rememberMe) {
        cookieAge = 14 * 24 * 3600;
      }

      /* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: cookieAge,
        subject: user._id.toString(),
      });

      res.cookie('token', token, {
        maxAge: cookieAge * 1000,
        httpOnly: true,
      });
      res.json({ message: 'Successfully signed in' });
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  // eslint-disable-next-line consistent-return
  signUpUser: async (req, res) => {
    try {
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

      if (await User.exists({ username })) {
        throw new Error('Username already used');
      }
      if (password !== password2) {
        throw new Error('Passwords do not match');
      }

      const passwordHash = await bcrypt.hash(password, saltRounds);
      const newUser = await User.create({
        firstName,
        lastName,
        username,
        email,
        password_hash: passwordHash,
        acceptTos,
        address,
      });
      res.json(newUser);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  signOutUser: (req, res) => {
    try {
      res.clearCookie('_t');
      res.json({ success: true });
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
};
