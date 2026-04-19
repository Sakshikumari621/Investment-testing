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

    // --- Dynamic Growth Catch-up Logic ---
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const growthSchedule = getGrowthSchedule(currentYear, currentMonth);

    // Find the earliest completed deposit to determine the growth start date
    const completedDeposits = deposits.filter(d => d.status === 'Completed');
    const earliestDeposit = [...completedDeposits].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
    
    // If no completed deposits, ensure no growth exists and skip
    if (!earliestDeposit) {
      await Growth.deleteMany({ user: req.user.id });
    } else {
      const growthStartDate = new Date(earliestDeposit.createdAt);
      growthStartDate.setHours(0, 0, 0, 0);

      // Clean up any growth records dated before the first deposit (Production Rule)
      await Growth.deleteMany({ 
        user: req.user.id, 
        date: { $lt: growthStartDate } 
      });

      // Get existing growth for THIS month
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const existingGrowth = await Growth.find({
        user: req.user.id,
        date: { $gte: startOfMonth }
      });
      const existingDays = new Set(existingGrowth.map(g => g.date.getDate()));

      // Apply growth for any missing weekdays up to today
      for (const dayStr in growthSchedule) {
        const day = parseInt(dayStr);
        const dayDate = new Date(currentYear, currentMonth, day);
        
        // Only apply if the day is >= the first deposit date
        if (day <= currentDay && !existingDays.has(day) && dayDate >= growthStartDate) {
          // Calculate balance up to this point
          const dateLimit = new Date(currentYear, currentMonth, day, 23, 59, 59);
          
          const depSoFar = deposits
            .filter(d => d.status === 'Completed' && d.createdAt <= dateLimit)
            .reduce((acc, curr) => acc + curr.amount, 0);
          const paySoFar = payouts
            .filter(p => p.status === 'Approved' && p.createdAt <= dateLimit)
            .reduce((acc, curr) => acc + curr.amount, 0);
          const growthSoFar = (await Growth.find({ user: req.user.id, date: { $lt: new Date(currentYear, currentMonth, day) } }))
            .reduce((acc, curr) => acc + curr.amount, 0);

          const balanceToday = depSoFar - paySoFar + growthSoFar;
          const dailyPct = growthSchedule[day];
          const growthAmount = balanceToday * (dailyPct / 100);

          await Growth.create({
            user: req.user.id,
            amount: growthAmount,
            percentage: dailyPct,
            date: dayDate
          });
        }
      }
    }

    // Refresh growth tokens after potential creations
    const allGrowth = await Growth.find({ user: req.user.id }).sort({ date: -1 });

    // Calculate real balance including growth
    const totalDeposited = deposits
      .filter(d => d.status === 'Completed')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalWithdrawn = payouts
      .filter(p => p.status === 'Approved')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalGrowthEarned = allGrowth.reduce((acc, curr) => acc + curr.amount, 0);
    const currentBalance = totalDeposited - totalWithdrawn + totalGrowthEarned;

    res.status(200).json({
      success: true,
      data: {
        deposits,
        payouts,
        growthHistory: allGrowth,
        currentBalance,
        totalDeposited,
        totalWithdrawn,
        totalGrowthEarned
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
