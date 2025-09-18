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

    const result = await db.query(sql, [Name, Email, Password, ConfirmPassword]);

    res.status(201).json({
      message: "User created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const sql = "SELECT id, Name, Email FROM User WHERE isActive = 1";
    const rows = await db.query(sql);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "SELECT id, Name, Email FROM User WHERE id = ? AND isActive = 1";
    const rows = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// ✅ Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email, Password, ConfirmPassword } = req.body;

    if (!Name || !Email) {
      return res.status(400).json({ error: "Name and Email are required" });
    }

    if ((Password || ConfirmPassword) && Password !== ConfirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    let sql, params;

    if (Password && ConfirmPassword) {
      sql = `UPDATE User SET Name = ?, Email = ?, Password = ?, ConfirmPassword = ? WHERE id = ? AND isActive = 1`;
      params = [Name, Email, Password, ConfirmPassword, id];
    } else {
      sql = `UPDATE User SET Name = ?, Email = ? WHERE id = ? AND isActive = 1`;
      params = [Name, Email, id];
    }

    const result = await db.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found or inactive" });
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "UPDATE User SET isActive = 0 WHERE id = ?";
    const result = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found or already deleted" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ✅ Login user
exports.loginUser = async (req, res) => {
  try {
    const { identifier, Password } = req.body; // identifier = Name OR Email

    if (!identifier || !Password) {
      return res.status(400).json({ error: "Email/Name and Password are required" });
    }

    const sql = `
      SELECT id, Name, Email, Password 
      FROM User 
      WHERE (Email = ? OR Name = ?) AND isActive = 1
      LIMIT 1
    `;
    const rows = await db.query(sql, [identifier, identifier]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    if (user.Password !== Password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        Name: user.Name,
        Email: user.Email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};
