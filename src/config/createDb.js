require('dotenv').config();
const { Client } = require('pg');

const createDatabase = async () => {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default db
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'jobapp'");
    if (res.rowCount === 0) {
      console.log('Database "jobapp" not found, creating it...');
      await client.query('CREATE DATABASE jobapp');
      console.log('Database "jobapp" created successfully.');
    } else {
      console.log('Database "jobapp" already exists.');
    }
  } catch (err) {
    console.error('Error creating database:\\n', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

createDatabase();
