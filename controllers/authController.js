const pool = require('../db');
const bcrypt = require('bcrypt'); // if you hash passwords



exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required.' });

  try {
    const rows = await pool.query('SELECT * FROM User WHERE Username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = rows[0];

    if (password !== user.Password) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    res.json({ success: true, message: 'Login successful', userId: user.UserID, username: user.Username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};
