



const db = require("../config/db"); // your MySQL connection pool

// Insert: from website (only question, pending)
exports.addQuestionFromWebsite = async (req, res) => {
  try {
    const { Title, slug, detailquestion, questionername, questionaremail, tags, tafseel } = req.body;

    const sql = `
      INSERT INTO fatawa (Title, slug, detailquestion, questionername, questionaremail, tags, tafseel, status, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 1)
    `;

    const result = await db.query(sql, [
      Title,
      slug,
      detailquestion,
      questionername,
      questionaremail,
      tags || null,
      tafseel || null,
    ]);

    res.status(201).json({ message: "Question submitted successfully", id: result.insertId });
  } catch (error) {
    console.error("❌ addQuestionFromWebsite error:", error);
    res.status(500).json({ error: "Failed to submit question" });
  }
};

// Insert: from dashboard (with answer, directly published)
exports.addFatwaFromDashboard = async (req, res) => {
  try {
    const { Title, slug, detailquestion, tags, tafseel, Answer, muftisahab } = req.body;

    const sql = `
      INSERT INTO fatawa (Title, slug, detailquestion, tags, tafseel, Answer, muftisahab, status, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'answered', 1)
    `;

    const result = await db.query(sql, [
      Title,
      slug,
      detailquestion,
      tags || null,
      tafseel || null,
      Answer,
      muftisahab,
    ]);

    res.status(201).json({ message: "Fatwa created successfully", id: result.insertId });
  } catch (error) {
    console.error("❌ addFatwaFromDashboard error:", error);
    res.status(500).json({ error: "Failed to create fatwa" });
  }
};

// Get all (with limit/offset)
exports.getAllFatwas = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const sql = "SELECT * FROM fatawa WHERE isActive = 1 LIMIT ? OFFSET ?";
    const rows = await db.query(sql, [limit, offset]);

    res.json(rows);
  } catch (error) {
    console.error("❌ getAllFatwas error:", error);
    res.status(500).json({ error: "Failed to fetch fatwas" });
  }
};

// Get by ID
exports.getFatwaById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM fatawa WHERE id = ? AND isActive = 1";
    const rows = await db.query(sql, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Fatwa not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ getFatwaById error:", error);
    res.status(500).json({ error: "Failed to fetch fatwa" });
  }
};

// Update (answer + status update)
exports.updateFatwa = async (req, res) => {
  try {
    const { id } = req.params;
    const { Title, tags, tafseel, detailquestion, Answer, muftisahab, status } = req.body;

    const sql = `
      UPDATE fatawa 
      SET Title = ?, tags = ?, tafseel = ?, detailquestion = ?, Answer = ?, muftisahab = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND isActive = 1
    `;

    await db.query(sql, [
      Title || null,
      tags || null,
      tafseel || null,
      detailquestion || null,
      Answer || null,
      muftisahab || null,
      status || "answered",
      id,
    ]);

    res.json({ message: "Fatwa updated successfully" });
  } catch (error) {
    console.error("❌ updateFatwa error:", error);
    res.status(500).json({ error: "Failed to update fatwa" });
  }
};

// Soft delete
exports.deleteFatwa = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "UPDATE fatawa SET isActive = 0 WHERE id = ?";
    await db.query(sql, [id]);

    res.json({ message: "Fatwa soft deleted successfully" });
  } catch (error) {
    console.error("❌ deleteFatwa error:", error);
    res.status(500).json({ error: "Failed to delete fatwa" });
  }
};




// Get latest 3 fatawa
exports.getLatestFatwas = async (req, res) => {
  try {
    const sql = `
      SELECT id, Title, slug, detailquestion, status, created_at, Likes, Views
      FROM fatawa 
      WHERE isActive = 1 
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    const rows = await db.query(sql);

    res.json(rows);
  } catch (error) {
    console.error("❌ getLatestFatwas error:", error);
    res.status(500).json({ error: "Failed to fetch latest fatawa" });
  }
};
