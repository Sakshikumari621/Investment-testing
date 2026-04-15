const Deposit = require('../models/Deposit');
const Payout = require('../models/Payout');

// @desc    Create a new deposit
// @route   POST /api/transactions/deposit
// @access  Private
exports.createDeposit = async (req, res) => {
  try {
    const { amount, method } = req.body;

    const deposit = await Deposit.create({
      user: req.user.id, // from protect middleware
      amount,
      method,
      status: 'Pending' // Always pending so Admin can approve
    });

    res.status(201).json({ success: true, data: deposit });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Request a payout
// @route   POST /api/transactions/payout
// @access  Private
exports.createPayout = async (req, res) => {
  try {
    const { amount, method, details } = req.body;

    const payout = await Payout.create({
      user: req.user.id,
      amount,
      method,
      details,
      status: 'Pending'
    });

    res.status(201).json({ success: true, data: payout });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get user's transactions (deposits & payouts) and calculate balance
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id }).sort({ createdAt: -1 });
    const payouts = await Payout.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Calculate real balance on the fly
    const totalDeposited = deposits
      .filter(d => d.status === 'Completed')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalWithdrawn = payouts
      .filter(p => p.status === 'Approved')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const currentBalance = totalDeposited - totalWithdrawn;

    res.status(200).json({
      success: true,
      data: {
        deposits,
        payouts,
        currentBalance,
        totalDeposited,
        totalWithdrawn
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
