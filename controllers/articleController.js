const db = require('../db');

// Create a new article with optional cover image
exports.createArticle = async (req, res) => {
  try {
    const { Title, slug, tags, seo, writer, ArticleText } = req.body;
    const coverImage = req.file ? req.file.buffer : null;

    const sql = `
      INSERT INTO Article (Title, slug, tags, seo, writer, ArticleText, coverImage, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(sql, [
      Title,
      slug,
      tags || null,
      seo || null,
      writer || null,
      ArticleText || null,
      coverImage,
    ]);

    res.status(201).json({ success: true, message: "Article created successfully", id: result.insertId });
  } catch (error) {
    console.error('❌ createArticle error:', error);
    res.status(500).json({ success: false, error: "Failed to create article" });
  }
};

// Get all articles (without cover image) with pagination
exports.getAllArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    const sql = `
      SELECT id, Title, slug, tags, seo, writer, ArticleText, isActive, Likes, Views
      FROM Article
      WHERE isActive = 1
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(sql, [limit, offset]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ getAllArticles error:', error);
    res.status(500).json({ success: false, error: "Failed to fetch articles" });
  }
};

// Get single article by ID (without image)
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, Title, slug, tags, seo, writer, ArticleText, isActive, Likes, Views
      FROM Article
      WHERE id = ? AND isActive = 1
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Article not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('❌ getArticleById error:', error);
    res.status(500).json({ success: false, error: "Failed to fetch article" });
  }
};

// Get article cover image by ID
exports.getArticleImage = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `SELECT coverImage FROM Article WHERE id = ? AND isActive = 1`;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0 || !rows[0].coverImage) {
      return res.status(404).json({ success: false, error: "Image not found" });
    }

    res.set("Content-Type", "image/jpeg"); // Adjust if storing PNG or other formats
    res.send(rows[0].coverImage);
  } catch (error) {
    console.error('❌ getArticleImage error:', error);
    res.status(500).json({ success: false, error: "Failed to fetch image" });
  }
};

// Update article (partial update, optional cover image)
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { Title, tags, seo, writer, ArticleText } = req.body;
    const coverImage = req.file ? req.file.buffer : null;

    const fields = [];
    const values = [];

    if (Title !== undefined) { fields.push('Title = ?'); values.push(Title); }
    if (tags !== undefined) { fields.push('tags = ?'); values.push(tags); }
    if (seo !== undefined) { fields.push('seo = ?'); values.push(seo); }
    if (writer !== undefined) { fields.push('writer = ?'); values.push(writer); }
    if (ArticleText !== undefined) { fields.push('ArticleText = ?'); values.push(ArticleText); }
    if (coverImage) { fields.push('coverImage = ?'); values.push(coverImage); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: "No fields provided to update" });
    }

    values.push(id);

    const sql = `UPDATE Article SET ${fields.join(', ')} WHERE id = ? AND isActive = 1`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Article not found or inactive" });
    }

    res.json({ success: true, message: "Article updated successfully" });
  } catch (error) {
    console.error('❌ updateArticle error:', error);
    res.status(500).json({ success: false, error: "Failed to update article" });
  }
};

// Soft delete article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `UPDATE Article SET isActive = 0 WHERE id = ?`;
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Article not found or already deleted" });
    }

    res.json({ success: true, message: "Article soft deleted successfully" });
  } catch (error) {
    console.error('❌ deleteArticle error:', error);
    res.status(500).json({ success: false, error: "Failed to delete article" });
  }
};
