require('dotenv').config();
const app = require('./app');
require('./config/supabase'); // Initialize Supabase connection check

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
