const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in cookies first, then in Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. If no token, but we have an admin session, we allow it (for admin document access)
  // but we should still try to find the user if possible.
  if (!token) {
    if (req.session && req.session.adminUser) {
      return next();
    }
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to req object
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      // If user not found but admin session exists, still allow
      if (req.session && req.session.adminUser) {
        return next();
      }
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    next();
  } catch (err) {
    // If token error but admin session exists, still allow
    if (req.session && req.session.adminUser) {
      return next();
    }
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

module.exports = { protect };
