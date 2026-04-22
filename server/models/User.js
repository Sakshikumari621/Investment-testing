const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Avoid returning password in queries by default
  },
  balance: {
    type: Number,
    default: 0
  },
  baseAmount: {
    type: Number,
    default: 0
  },
  // --- KYC FIELDS ---
  panNumber: {
    type: String, // Stored encrypted
    required: [true, 'Please provide a PAN number']
  },
  aadhaarNumber: {
    type: String, // Stored encrypted
    required: [true, 'Please provide an Aadhaar number']
  },
  panPhoto: {
    type: String, // File path
    required: [true, 'Please upload PAN card photo']
  },
  aadhaarPhoto: {
    type: String, // File path
    required: [true, 'Please upload Aadhaar card photo']
  },
  kycStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Partially Approved'],
    default: 'Pending'
  },
  panVerified: {
    type: Boolean,
    default: false
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  kycRejectionReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password and sync KYC status before saving
userSchema.pre('save', async function() {
  // Sync KYC Status based on verification flags
  if (this.panVerified && this.aadhaarVerified) {
    this.kycStatus = 'Approved';
  } else if (this.panVerified || this.aadhaarVerified) {
    // Only set to Partially Approved if it's currently Pending or already Partially Approved
    // (Don't overwrite 'Rejected' or 'Approved' accidentally if one flag is lowered)
    if (this.kycStatus === 'Pending' || this.kycStatus === 'Partially Approved') {
      this.kycStatus = 'Partially Approved';
    }
  }

  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
