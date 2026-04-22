const Deposit = require('../models/Deposit');
const Payout = require('../models/Payout');
const Growth = require('../models/Growth');
const User = require('../models/User');

// Helper to get weekdays in a month
const getWeekdaysInMonth = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      weekdays.push(i);
    }
  }
  return weekdays;
};

// Deterministic growth percentages that sum to 4%
const getGrowthSchedule = (year, month) => {
  const weekdays = getWeekdaysInMonth(year, month);
  const totalGrowth = 4.0;
  
  // Create deterministic "random" weights using a seed
  // (Month + Year + DayIndex)
  let weights = weekdays.map((day, ix) => {
    const seed = Math.sin(year * 100 + month * 10 + day) * 10000;
    return Math.abs(seed - Math.floor(seed));
  });

  const sumWeights = weights.reduce((a, b) => a + b, 0);
  const normalized = weights.map(w => (w / sumWeights) * totalGrowth);
  
  // Fix floating point sum to be exactly 4.0
  const currentSum = normalized.reduce((a, b) => a + b, 0);
  normalized[0] += (totalGrowth - currentSum);

  const schedule = {};
  weekdays.forEach((day, ix) => {
    schedule[day] = normalized[ix];
  });
  return schedule;
};

// @desc    Create a new deposit
// @route   POST /api/transactions/deposit
// @access  Private
exports.createDeposit = async (req, res) => {
  try {
    const { amount, method, network } = req.body;

    const deposit = await Deposit.create({
      user: req.user.id, // from protect middleware
      amount,
      method,
      network: network || '',
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
    const { amount, method, details, network } = req.body;

    const payout = await Payout.create({
      user: req.user.id,
      amount,
      method,
      details,
      network: network || '',
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
    const deposits = await Deposit.find({ user: req.user.id }).sort({ createdAt: 1 });
    const payouts = await Payout.find({ user: req.user.id }).sort({ createdAt: 1 });
    const existingGrowth = await Growth.find({ user: req.user.id }).sort({ date: 1 });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const today = new Date(currentYear, currentMonth, now.getDate());

    // Find first completed deposit
    const firstDeposit = deposits.find(d => d.status === 'Completed');
    if (!firstDeposit) {
      return res.status(200).json({
        success: true,
        data: { deposits, payouts, growthHistory: [], currentBalance: 0, totalDeposited: 0, totalWithdrawn: 0, totalGrowthEarned: 0 }
      });
    }

    let runningBalance = 0;
    let runningBase = 0;
    let totalGrowthEarned = 0;
    let growthHistory = [];

    // Helper to process a specific date for transactions
    const getTransactionsForDay = (date) => {
      const start = new Date(date).setHours(0, 0, 0, 0);
      const end = new Date(date).setHours(23, 59, 59, 999);
      
      const dayDeps = deposits.filter(d => d.status === 'Completed' && d.createdAt >= start && d.createdAt <= end);
      const dayPays = payouts.filter(p => p.status === 'Approved' && p.createdAt >= start && p.createdAt <= end);
      
      return { dayDeps, dayPays };
    };

    // --- RECONSTRUCTION ENGINE ---
    // We start from the day of the first deposit and simulate growth up to today
    let iterDate = new Date(firstDeposit.createdAt);
    iterDate.setHours(0, 0, 0, 0);

    while (iterDate <= today) {
      const { dayDeps, dayPays } = getTransactionsForDay(iterDate);
      
      // 1. Process Deposits & Withdrawals (Impacts Base Immediately)
      let hadWithdrawal = dayPays.length > 0;
      let hadDeposit = dayDeps.length > 0;

      for (const d of dayDeps) runningBalance += d.amount;
      for (const p of dayPays) runningBalance -= p.amount;

      if (hadWithdrawal || hadDeposit || runningBase === 0) {
        runningBase = Math.floor(runningBalance / 500) * 500;
      }

      // 2. Process Growth (Weekdays Only)
      const isWeekday = iterDate.getDay() !== 0 && iterDate.getDay() !== 6;
      if (isWeekday) {
        // Find existing record or create new one
        let growthRecord = existingGrowth.find(g => g.date.toDateString() === iterDate.toDateString());
        
        if (!growthRecord && iterDate < today) {
          // Calculate new growth
          const schedule = getGrowthSchedule(iterDate.getFullYear(), iterDate.getMonth());
          const dailyPct = schedule[iterDate.getDate()];
          const growthAmount = runningBase * (dailyPct / 100);

          growthRecord = await Growth.create({
            user: req.user.id,
            amount: growthAmount,
            percentage: dailyPct,
            baseAmount: runningBase,
            date: new Date(iterDate)
          });
        }

        if (growthRecord) {
          runningBalance += growthRecord.amount;
          totalGrowthEarned += growthRecord.amount;
          growthHistory.push(growthRecord);

          // Check if balance hit next step upward (+500)
          if (runningBalance >= (runningBase + 500)) {
            runningBase = Math.floor(runningBalance / 500) * 500;
          }
        }
      }

      // Move to next day
      iterDate.setDate(iterDate.getDate() + 1);
    }

    // Update user's current runningBase and balance for display stability
    await User.findByIdAndUpdate(req.user.id, { 
      balance: runningBalance,
      baseAmount: runningBase 
    });

    res.status(200).json({
      success: true,
      data: {
        deposits: deposits.sort((a,b) => b.createdAt - a.createdAt),
        payouts: payouts.sort((a,b) => b.createdAt - a.createdAt),
        growthHistory: growthHistory.reverse(),
        currentBalance: runningBalance,
        currentBase: runningBase,
        totalDeposited: deposits.filter(d => d.status === 'Completed').reduce((acc, d) => acc + d.amount, 0),
        totalWithdrawn: payouts.filter(p => p.status === 'Approved').reduce((acc, p) => acc + p.amount, 0),
        totalGrowthEarned
      }
    });
  } catch (error) {
    console.error('getTransactions Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
