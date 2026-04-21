require('dotenv').config();
const app = require('./app');
require('./config/supabase'); // Initialize Supabase connection check

const PORT = process.env.PORT || 5000;

// Only listen if not running as a serverless function (e.g. locally)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}

module.exports = app;
