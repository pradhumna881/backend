const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic security
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}));

// Enable compression
app.use(compression());

// CORS setup - UPDATED FOR NETLIFY CONNECTION
app.use(cors({
  origin: [
    'https://myrehabcentre.com',           // Your custom domain
    'https://addictionfreelifestyle.netlify.app', // Your Netlify subdomain
    'http://localhost:3000',               // Local development
    'http://localhost:5173'                // Vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Requested-With',
    'X-Requested-At'
  ]
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Health check
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'success',
    message: 'My Rehab Centre API is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// API routes
app.use('/api/addictions', require('./routes/addictions'));
app.use('/api/health', require('./routes/health'));

// 404 handler - UPDATED FOR EXPRESS 5 COMPATIBILITY
app.use('/*catchAll', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 My Rehab Centre API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health-check`);
});

module.exports = app;
