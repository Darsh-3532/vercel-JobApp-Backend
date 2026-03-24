const { pool } = require('../../config/db');

exports.applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    // Check if job exists
    const jobCheck = await pool.query('SELECT id FROM Jobs WHERE id = $1', [jobId]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const appCheck = await pool.query('SELECT id FROM Applications WHERE "userId" = $1 AND "jobId" = $2', [userId, jobId]);
    if (appCheck.rows.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const newApplication = await pool.query(
      'INSERT INTO Applications ("userId", "jobId") VALUES ($1, $2) RETURNING *',
      [userId, jobId]
    );

    res.status(201).json({ message: 'Application submitted successfully', application: newApplication.rows[0] });
  } catch (error) {
    console.error('applyToJob error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
};

exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Join Applications with Jobs to return full job details
    const result = await pool.query(`
      SELECT a.id AS application_id, a.status, a.applied_at, j.*
      FROM Applications a
      JOIN Jobs j ON a."jobId" = j.id
      WHERE a."userId" = $1
      ORDER BY a.applied_at DESC
    `, [userId]);

    res.status(200).json({ count: result.rows.length, appliedJobs: result.rows });
  } catch (error) {
    console.error('getAppliedJobs error:', error);
    res.status(500).json({ message: 'Server error fetching applied jobs' });
  }
};
