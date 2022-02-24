const passwordGenerator = require('generate-password');
const bcrypt = require('bcrypt');
const { sendEmail } = require('./services/mail');
const User = require('./models/user');

const saltRounds = 10;

const googleConfigs = {
  clientID: process.env.GAPP_CLIENT_ID,
  clientSecret: process.env.GAPP_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/auth/google/callback',
};

const afterGoogleLogin = async function (
  accessToken,
  refreshToken,
  profile,
  cb
) {
  try {
    let user = await User.findOne({ email: profile._json.email });
    if (!user) {
      const username = `${
        profile._json.email.split('@')[0]
      }_${passwordGenerator.generate({
        length: 3,
        numbers: true,
        lowercase: false,
        uppercase: false,
      })}`;

      const password = passwordGenerator.generate({
        length: 10,
        numbers: true,
      });
      const passwordHash = await bcrypt.hash(password, saltRounds);

      user = await User.create({
        username,
        email: profile._json.email,
        firstName: profile._json.given_name,
        lastName: profile._json.family_name,
        address: 'address',
        password_hash: passwordHash,
      });
      const emailOptions = {
        from: process.env.EMAIL_USER,
        to: profile._json.email,
        subject: 'Paying it forward password',
        html: ` <h1>Hi ${profile._json.given_name},</h1>
  <p>Here is your automatically generated password: ${password}</p>
  <p>Please feel free to change it anytime you want</p>
  <p>Also please don't forget to add your address, it is set by default to "address"</p>
  <p>Have a nice day!</p>
  <p>Best regards,</p>
  <p>Your friend,</p>
  <p>Paying it forward Team</p>`,
      };
      sendEmail(emailOptions);
    }

    cb(null, user.toJSON());
  } catch (err) {
    cb(err, null);
  }
};

module.exports = { googleConfigs, afterGoogleLogin };
