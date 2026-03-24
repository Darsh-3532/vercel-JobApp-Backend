require('dotenv').config({ path: '../../.env' });
const { pool } = require('./db');

async function checkDatabase() {
  try {
    const users = await pool.query('SELECT email, role, created_at FROM Users');
    console.log('\\n----- USERS TABLE -----');
    if (users.rows.length === 0) {
      console.log('No users found.');
    } else {
      console.table(users.rows);
    }

    const jobs = await pool.query('SELECT company, position, type, location FROM Jobs');
    console.log('\\n----- JOBS TABLE -----');
    if (jobs.rows.length === 0) {
      console.log('No jobs found. (Try logging in as an Admin to create some!)');
    } else {
      console.table(jobs.rows);
    }
    
    const apps = await pool.query('SELECT * FROM Applications');
    console.log('\\n----- APPLICATIONS TABLE -----');
    if (apps.rows.length === 0) {
      console.log('No applications found.');
    } else {
      console.table(apps.rows);
    }

  } catch (err) {
    console.error('\\nError checking database:\\n', err.message);
  } finally {
    pool.end();
  }
}

checkDatabase();
