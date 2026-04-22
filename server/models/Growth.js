const mongoose = require('mongoose');

const growthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  baseAmount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user only has one growth record per day
growthSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Growth', growthSchema);
