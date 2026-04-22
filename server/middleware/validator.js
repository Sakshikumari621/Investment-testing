const { check, validationResult } = require('express-validator');

// Register validation rules
const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('panNumber', 'Please enter a valid PAN number').matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/),
  check('aadhaarNumber', 'Please enter a valid 12-digit Aadhaar number').matches(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/)
];

// Login validation rules
const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  validate
};
