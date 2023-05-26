const { body } = require('express-validator');
const User = require('../models/user');

const registerValidators = [
  body('email', 'Please enter correct email').isEmail().custom( async (value, req) => {
    try {
      const user = await User.findOne({ email: value});
      if (user) {
        return Promise.reject('This email has already created');
      }
    } catch(error) {
      console.log('Error: ', error);
    }
  }).normalizeEmail(),
  body('name', 'Name length must be longer than 2 symbols').isLength({ min: 2 }).trim(),
  body('password', 'Password must be min 3 or max 36 symbols').isLength({ min: 3, max: 36 }).isAlphanumeric(),
  body('confirm').custom((value, {req}) => {
    if (value !== req.body.password) {
      throw new Error('Passwords must match');
    }
    return true;
  }),
];

const loginValidators = [
  body('email', 'Please enter correct email').isEmail().custom( async (value, req) => {
    try {
      const user = await User.findOne({ email: value});
      // console.log('loginValidators user', user);
      // console.log('loginValidators value', value);
      // console.log('loginValidators req', req);
      if (user.email !== value) {
        return Promise.reject('There is no such, please make registration');
      }
    } catch(error) {
      console.log('Error: ', error);
    }
  }).normalizeEmail(),
  body('password', 'Password incorrect').isAlphanumeric(),

];

const courseValidators = [
  body('title', 'Min value must be 3 symbols').isLength({ min: 3 }).trim(),
  body('price', 'Please enter correct price').isNumeric(),
  body('img', 'Please enter correct url').isURL(),
];

module.exports = {
  registerValidators,
  loginValidators,
  courseValidators
}
