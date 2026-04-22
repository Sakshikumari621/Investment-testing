const express = require('express');
const { register, login, getMe, logout, getDocument, resubmitKYC } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation, validate } = require('../middleware/validator');
const upload = require('../middleware/multerConfig');

const router = express.Router();

// Public routes
router.post(
  '/register', 
  upload.fields([
    { name: 'panPhoto', maxCount: 1 }, 
    { name: 'aadhaarPhoto', maxCount: 1 }
  ]), 
  registerValidation, 
  validate, 
  register
);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/documents/:filename', protect, getDocument);
router.post(
  '/resubmit-kyc',
  protect,
  upload.fields([
    { name: 'panPhoto', maxCount: 1 },
    { name: 'aadhaarPhoto', maxCount: 1 }
  ]),
  resubmitKYC
);
router.post('/logout', logout);

module.exports = router;
