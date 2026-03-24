const { pool } = require('../../config/db');

exports.getJobs = async (req, res) => {
  try {
    const { company, location, type } = req.query;
    
    let query = 'SELECT * FROM Jobs WHERE 1=1';
    const queryParams = [];
    
    // Search and filter logic
    if (company) {
      queryParams.push(`%${company}%`);
      query += ` AND company ILIKE $${queryParams.length}`;
    }
    if (location) {
      queryParams.push(`%${location}%`);
      query += ` AND location ILIKE $${queryParams.length}`;
    }
    if (type) {
      queryParams.push(type);
      query += ` AND type = $${queryParams.length}`;
    }
    
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, queryParams);
    res.status(200).json({ count: result.rows.length, jobs: result.rows });
  } catch (error) {
    console.error('getJobs error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { company, position, type, location } = req.body;
    if (!company || !position || !type || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newJob = await pool.query(
      'INSERT INTO Jobs (company, position, type, location, "adminId") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [company, position, type, location, req.user.id]
    );

    res.status(201).json({ message: 'Job created', job: newJob.rows[0] });
  } catch (error) {
    console.error('createJob error:', error);
    res.status(500).json({ message: 'Server error creating job' });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, position, type, location } = req.body;

    const authCheck = await pool.query('SELECT * FROM Jobs WHERE id = $1', [id]);
    if (authCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (authCheck.rows[0].adminId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await pool.query(
      'UPDATE Jobs SET company = COALESCE($1, company), position = COALESCE($2, position), type = COALESCE($3, type), location = COALESCE($4, location) WHERE id = $5 RETURNING *',
      [company, position, type, location, id]
    );

    res.status(200).json({ message: 'Job updated', job: updatedJob.rows[0] });
  } catch (error) {
    console.error('updateJob error:', error);
    res.status(500).json({ message: 'Server error updating job' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const authCheck = await pool.query('SELECT * FROM Jobs WHERE id = $1', [id]);
    if (authCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (authCheck.rows[0].adminId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await pool.query('DELETE FROM Jobs WHERE id = $1', [id]);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('deleteJob error:', error);
    res.status(500).json({ message: 'Server error deleting job' });
  }
};
