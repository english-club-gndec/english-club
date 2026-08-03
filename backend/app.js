const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Helper to normalize URLs (strip trailing slashes)
const normalizeUrl = (url) => (url || '').trim().replace(/\/+$/, '');

// CORS Middleware with explicit header reflection for credentials support
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    const reqOrigin = normalizeUrl(origin);
    const configuredOrigins = (process.env.FRONTEND_URL || '')
      .split(',')
      .map(normalizeUrl)
      .filter(Boolean);

    const defaultOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://english-club-beta.vercel.app'
    ].map(normalizeUrl);

    const allowedOrigins = [...configuredOrigins, ...defaultOrigins];
    const isAllowed = allowedOrigins.includes(reqOrigin) || reqOrigin.endsWith('.vercel.app');

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registration', require('./routes/registrationRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/recruitment', require('./routes/recruitmentRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/submission', require('./routes/submissionRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'English Club API is running' });
});

// For future routes:
// app.use('/api/v1/users', require('./routes/userRoutes'));

module.exports = app;
