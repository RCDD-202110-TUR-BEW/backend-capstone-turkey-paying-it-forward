const { body, validationResult } = require('express-validator');

const userValidationRules = () => [
  body('email')
    .notEmpty()
    .withMessage('Email should not be empty')
    .bail()
    .isEmail()
    .withMessage('Not valid email')
    .bail()
    .normalizeEmail(),
  body('username')
    .notEmpty()
    .withMessage('Username should not be empty')
    .bail()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be more than three and less than 30 characters')
    .matches(/^[a-zA-Z0-9._]*$/)
    .withMessage(
      'Username can contain only alphanumeric characters, period and underscore'
    )
    .trim(),
  body('firstName')
    .notEmpty()
    .withMessage('First name should not be empty')
    .bail()
    .isAlpha()
    .withMessage('The first name must contain alpha characters only')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name should not be empty')
    .bail()
    .isAlpha()
    .withMessage('The last name must contain alpha characters only')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password should not be empty')
    .bail()
    .isLength({ min: 6, max: 30 })
    .withMessage('Password must be more than six and less than 30 characters')
    .bail()
    .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage('Password must contain a number, uppercase and lowercase')
    .bail()
    .custom((value, { req }) => value === req.body.passwordConfirm)
    .withMessage('Passwords are not matching'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  userValidationRules,
  validate,
};
