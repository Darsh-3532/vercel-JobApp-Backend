const express = require('express');
const router = express.Router();
const jobsController = require('./jobs.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');

// Public route
router.get('/', jobsController.getJobs);

// Protected Admin routes
router.post('/', authMiddleware, roleMiddleware(['Admin']), jobsController.createJob);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), jobsController.updateJob);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), jobsController.deleteJob);

module.exports = router;
