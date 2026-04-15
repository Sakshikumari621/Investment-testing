const express = require('express');
const { createDeposit, createPayout, getTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all transaction routes
router.use(protect);

router.post('/deposit', createDeposit);
router.post('/payout', createPayout);
router.get('/', getTransactions);

module.exports = router;
