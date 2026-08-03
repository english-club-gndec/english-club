const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy error: Origin ${origin} is not allowed`));
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
