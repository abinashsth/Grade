const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// If behind a proxy (Heroku/Render/NGINX), trust proxy for correct IPs + rate limit
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
// Serve uploads folder statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB with local fallback in development
const connectWithFallback = async () => {
  const primary = process.env.MONGODB_URI;
  const local = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/gradepro';
  try {
    if (!primary) throw new Error('MONGODB_URI not set');
    await mongoose.connect(primary, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error (primary):', err);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Attempting local MongoDB fallback...');
      try {
        await mongoose.connect(local, { useNewUrlParser: true, useUnifiedTopology: true, directConnection: true });
        console.log(`Connected to local MongoDB at ${local}`);
      } catch (err2) {
        console.error('MongoDB connection error (local fallback):', err2);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

connectWithFallback();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/landing', require('./routes/landing'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GradePro API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
