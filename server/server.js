const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const helmet = require('helmet');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

// Load env vars
dotenv.config();

const app = express();

// Trust proxy for secure cookies on Render
app.set('trust proxy', 1);

// Basic Security
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "blob:", "https://api.qrserver.com"],
      "font-src": ["'self'", "data:", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      "connect-src": ["'self'", "https://*.mongodb.net"]
    }
  }
}));

// Serve uploaded files statically (Admin uses this to verify files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
  console.log('--- Starting Server Initialization ---');
  
  // Connect to database
  await connectDB();
  
  // Session middleware
  app.use(session({
    name: 'investment_sid', // Unique name to prevent conflicts
    secret: process.env.JWT_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  }));

  // Setup AdminJS
  await setupAdmin(app);

  // API Routes
  const authRoutes = require('./routes/authRoutes');
  const transactionRoutes = require('./routes/transactionRoutes');

  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);

  // Explicitly handle 404s for API requests (Regex catch-all for Express 5 compatibility)
  app.all(/^\/api\/.*$/, (req, res) => {
    res.status(404).json({ success: false, error: `API route not found: ${req.originalUrl}` });
  });

  // Serve static assets if in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));

    // Catch-all for React SPA (Regex catch-all for Express 5 compatibility)
    app.get(/^((?!\/api|\/admin).)*$/, (req, res) => {
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
    
    if (req.path.startsWith('/api')) {
      return res.status(status).json({ success: false, error: err.message || 'Server Error' });
    }
    
    if (!res.headersSent) {
      res.status(status).json({ success: false, error: 'Internal Server Error' });
    }
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
  });
};

initializeServer();
