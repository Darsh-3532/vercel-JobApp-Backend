const express = require('express');
const router = express.Router();
const applicationsController = require('./applications.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');

// Protected User routes
router.post('/jobs/:id/apply', authMiddleware, roleMiddleware(['User']), applicationsController.applyToJob);
router.get('/', authMiddleware, roleMiddleware(['User']), applicationsController.getAppliedJobs);

module.exports = router;
