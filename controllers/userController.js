const pool = require('../db'); // Adjust path if needed

// 1. Create a new user
exports.createUser = async (req, res) => {
  const { username, email, password, CreatedByID, CreatedByUsername } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: 'Username, email, and password are required.' });

  try {
    const rows = await pool.query('SELECT * FROM User WHERE Username = ? OR Email = ?', [username, email]);
    
    if (rows.length > 0) {
      return res.status(409).json({ error: 'Username or Email already exists.' });
    }

    // Store hashed password if preferred
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with creator info
    const result = await pool.query(
      `INSERT INTO User 
        (Username, Email, Password, CreatedByID, CreatedByUsername) 
        VALUES (?, ?, ?, ?, ?)`,
      [username, email, password /* or hashedPassword */, CreatedByID || null, CreatedByUsername || null]
    );

    res.status(201).json({ success: true, userId: result.insertId, username });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error creating user.' });
  }
};



  

// 2. Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM User');
        res.json(rows);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Database error while retrieving users.' });
    }
};

// 3. Get user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM User WHERE UserID = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ error: 'Database error while retrieving user.' });
    }
};
