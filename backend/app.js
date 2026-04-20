const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registration', require('./routes/registrationRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'English Club API is running' });
});

// For future routes:
// app.use('/api/v1/users', require('./routes/userRoutes'));

module.exports = app;
