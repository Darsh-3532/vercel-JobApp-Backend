const { pool } = require('./db');

const setupDatabase = async () => {
  try {
    // Enable uuid-ossp extension for UUID generation
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'User',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created or exists.');

    // Create Jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        "adminId" UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("adminId") REFERENCES Users(id) ON DELETE CASCADE
      );
    `);
    console.log('Jobs table created or exists.');

    // Create Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Applications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL,
        "jobId" UUID NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY ("jobId") REFERENCES Jobs(id) ON DELETE CASCADE,
        UNIQUE ("userId", "jobId")
      );
    `);
    console.log('Applications table created or exists.');

  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

setupDatabase().then(() => {
    console.log('Database setup complete.');
    process.exit(0);
});
