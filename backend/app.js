const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Helper to normalize URLs (strip trailing slashes)
const normalizeUrl = (url) => (url || '').trim().replace(/\/+$/, '');

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

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
      callback(null, true);
    } else {
      console.warn(`[CORS] Request from origin ${origin} blocked.`);
      callback(null, false);
    }
  },
  credentials: true
}));
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
