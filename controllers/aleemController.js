const db = require("../config/db");

// Create new entry
exports.createAleem = async (req, res) => {
  try {
    const { Ulmaekaram, Name, Position, About } = req.body;
    const profileFile = req.file ? req.file.buffer : null;

    const sql = `
      INSERT INTO NewAleemKiEntry (Ulmaekaram, Name, ProfileImg, Position, About, isActive)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    const result = await db.query(sql, [
      Ulmaekaram || null,
      Name,
      profileFile,
      Position || null,
      About || null,
    ]);

    res.status(201).json({
      message: "Entry created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ createAleem error:", error);
    res.status(500).json({ error: "Failed to create entry" });
  }
};

// Get all (without blob, with pagination)
exports.getAllAleem = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const sql = `
      SELECT id, Ulmaekaram, Name, Position, About, isActive
      FROM NewAleemKiEntry
      WHERE isActive = 1
      LIMIT ? OFFSET ?
    `;
    const rows = await db.query(sql, [limit, offset]);

    res.json(rows);
  } catch (error) {
    console.error("❌ getAllAleem error:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
};

// Get by ID (without blob)
exports.getAleemById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, Ulmaekaram, Name, Position, About, isActive
      FROM NewAleemKiEntry
      WHERE id = ? AND isActive = 1
    `;
    const rows = await db.query(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ getAleemById error:", error);
    res.status(500).json({ error: "Failed to fetch entry" });
  }
};

// Get profile image by ID
exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql =
      "SELECT ProfileImg FROM NewAleemKiEntry WHERE id = ? AND isActive = 1";
    const rows = await db.query(sql, [id]);

    if (!rows.length || !rows[0].ProfileImg) {
      return res.status(404).json({ error: "Profile image not found" });
    }

    res.set("Content-Type", "image/jpeg");
    res.send(rows[0].ProfileImg);
  } catch (error) {
    console.error("❌ getProfileById error:", error);
    res.status(500).json({ error: "Failed to fetch profile image" });
  }
};

// Update entry
exports.updateAleem = async (req, res) => {
  try {
    const { id } = req.params;
    const { Ulmaekaram, Name, Position, About } = req.body;
    const profileFile = req.file ? req.file.buffer : null;

    let sql, params;

    if (profileFile) {
      sql = `
        UPDATE NewAleemKiEntry
        SET Ulmaekaram = ?, Name = ?, Position = ?, About = ?, ProfileImg = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [Ulmaekaram || null, Name, Position || null, About || null, profileFile, id];
    } else {
      sql = `
        UPDATE NewAleemKiEntry
        SET Ulmaekaram = ?, Name = ?, Position = ?, About = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [Ulmaekaram || null, Name, Position || null, About || null, id];
    }

    await db.query(sql, params);

    res.json({ message: "Entry updated successfully" });
  } catch (error) {
    console.error("❌ updateAleem error:", error);
    res.status(500).json({ error: "Failed to update entry" });
  }
};

// Soft delete
exports.deleteAleem = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "UPDATE NewAleemKiEntry SET isActive = 0 WHERE id = ?";
    await db.query(sql, [id]);

    res.json({ message: "Entry soft deleted successfully" });
  } catch (error) {
    console.error("❌ deleteAleem error:", error);
    res.status(500).json({ error: "Failed to delete entry" });
  }
};
