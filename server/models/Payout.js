const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount']
  },
  method: {
    type: String,
    required: [true, 'Please provide a payout method']
  },
  network: {
    type: String,
    default: ''
  },
  // Bank Details
  accountHolderName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  branchName: { type: String, default: '' },
  // UPI
  upiId: { type: String, default: '' },
  // Crypto
  walletAddress: { type: String, default: '' },
  details: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payout', payoutSchema);
