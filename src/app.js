const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Import Routes
const authRoutes = require('./features/auth/auth.routes');
const jobsRoutes = require('./features/jobs/jobs.routes');
const applicationsRoutes = require('./features/applications/applications.routes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
