const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/cryptoUtils');

// Helper function to create JWT and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        kycStatus: user.kycStatus
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, panNumber, aadhaarNumber } = req.body;

    // Check for files
    if (!req.files || !req.files.panPhoto || !req.files.aadhaarPhoto) {
      return res.status(400).json({ success: false, error: 'Please upload both PAN and Aadhaar photos' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists with that email' });
    }

    // Encrypt sensitive data
    const encryptedPan = encrypt(panNumber);
    const encryptedAadhaar = encrypt(aadhaarNumber);

    // Create user
    user = await User.create({
      name,
      email,
      password,
      panNumber: encryptedPan,
      aadhaarNumber: encryptedAadhaar,
      panPhoto: req.files.panPhoto[0].path,
      aadhaarPhoto: req.files.aadhaarPhoto[0].path,
      kycStatus: 'Pending'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(400).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // req.user is set in authMiddleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        panNumber: decrypt(user.panNumber),
        aadhaarNumber: decrypt(user.aadhaarNumber),
        kycStatus: user.kycStatus,
        panVerified: user.panVerified,
        aadhaarVerified: user.aadhaarVerified,
        kycRejectionReason: user.kycRejectionReason,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const path = require('path');
const fs = require('fs');

// @desc    Get secure document
// @route   GET /api/auth/documents/:filename
// @access  Private
exports.getDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const uploadDir = process.env.UPLOAD_PATH || 'uploads';
    const filePath = path.resolve(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Authorization check: User must be admin or the one who uploaded it
    // Check for Admin session (Plan B / Global session)
    const isAdmin = (req.session && req.session.adminUser) || 
                    (req.user && req.user.email === (process.env.ADMIN_EMAIL || 'admin@example.com'));
    
    if (!isAdmin) {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
      }
      const user = await User.findById(req.user.id);
      const isOwner = user.panPhoto.includes(filename) || user.aadhaarPhoto.includes(filename);
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Unauthorized access to this document' });
      }
    }

    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private 
exports.logout = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // expires in 10 secs
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Resubmit KYC documents
// @route   POST /api/auth/resubmit-kyc
// @access  Private
exports.resubmitKYC = async (req, res) => {
  try {
    const { panNumber, aadhaarNumber } = req.body;

    // Check for files
    if (!req.files || !req.files.panPhoto || !req.files.aadhaarPhoto) {
      return res.status(400).json({ success: false, error: 'Please upload both PAN and Aadhaar photos' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Only allow resubmission if status is Rejected
    if (user.kycStatus !== 'Rejected') {
      return res.status(400).json({ success: false, error: 'KYC resubmission is only allowed for rejected accounts' });
    }

    // Encrypt sensitive data
    user.panNumber = encrypt(panNumber);
    user.aadhaarNumber = encrypt(aadhaarNumber);

    // Update photos
    user.panPhoto = req.files.panPhoto[0].path;
    user.aadhaarPhoto = req.files.aadhaarPhoto[0].path;

    // Reset status
    user.kycStatus = 'Pending';
    user.panVerified = false;
    user.aadhaarVerified = false;
    user.kycRejectionReason = '';

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        kycStatus: user.kycStatus
      }
    });
  } catch (err) {
    console.error('KYC Resubmission Error:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
