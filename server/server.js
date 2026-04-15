const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:"],
      "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
      "connect-src": ["'self'"]
    }
  }
}));



// Enable CORS
// Since the frontend is likely running on localhost:5173 (Vite default), we allow it.
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true // Allow cookies to be sent
}));



// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Admin Panel
const setupAdmin = require('./admin');
setupAdmin(app);

// Route files
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
