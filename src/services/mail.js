/* this function is used to send emails to users
    it takes in an object with the following properties:
    from: the sender's email address
    to: the recipient's email address
    subject: the subject of the email
    html: the html body of the email
*/
const nodemailer = require('nodemailer');
const logger = require('./logger');

module.exports = {
  sendEmail: async (emailOptions) => {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const res = await transporter.sendMail(emailOptions);
      return res;
    } catch (error) {
      logger.error(error);
      return error;
    }
  },
};
