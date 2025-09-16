const db = require("../config/db");

// Insert user
exports.createUser = async (req, res) => {
  try {
    const { Name, Email, Password, ConfirmPassword } = req.body;

    if (!Name || !Email || !Password || !ConfirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (Password !== ConfirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const sql = `
      INSERT INTO User (Name, Email, Password, ConfirmPassword, isActive)
      VALUES (?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(sql, [Name, Email, Password, ConfirmPassword]);

    res.status(201).json({ message: "User created successfully", id: result.insertId });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
};

// Get all users (only Name)
exports.getAllUsers = async (req, res) => {
  try {
    const sql = "SELECT id, Name FROM User WHERE isActive = 1";
    const [rows] = await db.query(sql);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get user by ID (only Name)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "SELECT id, Name FROM User WHERE id = ? AND isActive = 1";
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
