const db = require("../config/db");

// Create new tag
exports.createTag = async (req, res) => {
  try {
    const { Name, slug, iconClass, AboutTags } = req.body;
    const coverFile = req.file ? req.file.buffer : null;

    const sql = `
      INSERT INTO Tags (Name, slug, iconClass, tagsCover, AboutTags, isActive)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(sql, [
      Name,
      slug,
      iconClass || null,
      coverFile,
      AboutTags || null,
    ]);

    res.status(201).json({ message: "Tag created successfully", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create tag" });
  }
};

// Get all tags (without blob, with pagination)
exports.getAllTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const sql = `
      SELECT id, Name, slug, iconClass, AboutTags, isActive
      FROM Tags WHERE isActive = 1
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [limit, offset]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

// Get tag by ID (without blob)
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, Name, slug, iconClass, AboutTags, isActive
      FROM Tags WHERE id = ? AND isActive = 1
    `;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Tag not found" });

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tag" });
  }
};

// Get cover image by ID
exports.getTagCoverById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "SELECT tagsCover FROM Tags WHERE id = ? AND isActive = 1";
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0 || !rows[0].tagsCover) {
      return res.status(404).json({ error: "Cover image not found" });
    }

    res.set("Content-Type", "image/jpeg"); // adjust if PNG
    res.send(rows[0].tagsCover);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cover image" });
  }
};

// Update tag (with optional new cover image)
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, slug, iconClass, AboutTags } = req.body;
    const coverFile = req.file ? req.file.buffer : null;

    let sql, params;

    if (coverFile) {
      sql = `
        UPDATE Tags
        SET Name = ?, slug = ?, iconClass = ?, AboutTags = ?, tagsCover = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [Name, slug, iconClass, AboutTags, coverFile, id];
    } else {
      sql = `
        UPDATE Tags
        SET Name = ?, slug = ?, iconClass = ?, AboutTags = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [Name, slug, iconClass, AboutTags, id];
    }

    await db.query(sql, params);

    res.json({ message: "Tag updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update tag" });
  }
};

// Soft delete
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "UPDATE Tags SET isActive = 0 WHERE id = ?";
    await db.query(sql, [id]);

    res.json({ message: "Tag soft deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
};
