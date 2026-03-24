const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM Users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role
    let role = 'User';
    if (email.endsWith('@arnifi.com')) {
      role = 'Admin';
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO Users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, role]
    );

    // Generate JWT
    const payload = {
      id: newUser.rows[0].id,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: payload
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = userResult.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: payload
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
