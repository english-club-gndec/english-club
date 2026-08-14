require('dotenv').config();
const app = require('./app');
require('./config/supabase'); // Initialize Supabase connection check
const { startAutoRejectScheduler } = require('./services/autoRejectScheduler');

const PORT = process.env.PORT || 5000;

// Start background auto-reject scheduler for stale requested changes (7-day window)
startAutoRejectScheduler();

// Only listen if not running as a serverless function (e.g. locally)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}

module.exports = app;
