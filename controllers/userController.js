const pool = require('../db'); // Adjust path if needed

// 1. Create a new user
exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO User (Username, Email, Password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Database error while creating user.' });
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
