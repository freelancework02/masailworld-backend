const pool = require('../config/db'); // Ensure correct path (../config/db.js)
const bcrypt = require('bcrypt'); // Optional, for password hashing

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM User WHERE Username = ?', [username]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = rows[0];

    // If you use bcrypt-hashed passwords:
    // const isMatch = await bcrypt.compare(password, user.Password);
    // if (!isMatch) {
    //   return res.status(401).json({ error: 'Invalid username or password.' });
    // }

    // If passwords are stored in plain text (not recommended):
    if (password !== user.Password) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      userId: user.UserID,
      username: user.Username,
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};
