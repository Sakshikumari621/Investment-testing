const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const path = require('path');
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
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "blob:", "https://api.qrserver.com"],
      "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
      "connect-src": ["'self'", "http://localhost:5000", "http://127.0.0.1:5000", "*.mongodb.net"]
    }
  }
}));

// Enable CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// Simple Request Logger for Production Debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// Cookie parser
app.use(cookieParser());

// Admin Panel (Mount first to ensure its routes are handled)
const setupAdmin = require('./admin');

const initializeServer = async () => {
  await setupAdmin(app);

  // API Routes
  const authRoutes = require('./routes/authRoutes');
  const transactionRoutes = require('./routes/transactionRoutes');

  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);

  // Explicitly handle 404s for API requests to avoid falling through to HTML
  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: `API route not found: ${req.originalUrl}` });
  });

  // Serve static assets if in production
  if (process.env.NODE_ENV === 'production') {
    // Set static folder
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));

    // Catch-all for React SPA (Only for GET requests)
    app.get('*', (req, res) => {
      // Don't send index.html if it looks like an API or Admin request reaching here
      if (req.path.startsWith('/api') || req.path.startsWith('/admin')) {
        return res.status(404).json({ success: false, error: 'Not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Base route for development
    app.get('/', (req, res) => {
      res.send('API is running... (Development Mode. Run Vite on port 5173)');
    });
  }

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    
    // Always return JSON for errors on API routes
    if (req.path.startsWith('/api')) {
      return res.status(status).json({ success: false, error: err.message || 'Server Error' });
    }
    
    next(err);
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

initializeServer();
