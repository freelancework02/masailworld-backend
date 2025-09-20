const db = require("../config/db");

// Create article with image
exports.createArticle = async (req, res) => {
  try {
    const { Title, slug, tags, seo, writer, ArticleText } = req.body;
    const coverImage = req.file ? req.file.buffer : null;

    const sql = `
      INSERT INTO Article (Title, slug, tags, seo, writer, ArticleText, coverImage, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const result = await db.query(sql, [
      Title,
      slug,
      tags || null,
      seo || null,
      writer || null,
      ArticleText || null,
      coverImage,
    ]);

    res.status(201).json({ message: "Article created successfully", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create article" });
  }
};

// Get all articles (without heavy blob) + pagination
exports.getAllArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const sql = `
      SELECT id, Title, slug, tags, seo, writer, ArticleText, isActive, Likes, Views
      FROM Article WHERE isActive = 1
      LIMIT ? OFFSET ?
    `;
    const rows = await db.query(sql, [limit, offset]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};

// Get article by ID (without image)
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, Title, slug, tags, seo, writer, ArticleText, isActive,Likes, Views
      FROM Article WHERE id = ? AND isActive = 1
    `;
    const rows = await db.query(sql, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Article not found" });

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch article" });
  }
};

// Get cover image by article ID
exports.getArticleImage = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "SELECT coverImage FROM Article WHERE id = ? AND isActive = 1";
    const rows = await db.query(sql, [id]);

    if (rows.length === 0 || !rows[0].coverImage) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.set("Content-Type", "image/jpeg"); // adjust if storing PNG, etc.
    res.send(rows[0].coverImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
};

// Update article (with optional new image)
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { Title, tags, seo, writer, ArticleText } = req.body;
    const coverImage = req.file ? req.file.buffer : null;

    let sql, params;

    if (coverImage) {
      sql = `
        UPDATE Article
        SET Title = ?, tags = ?, seo = ?, writer = ?, ArticleText = ?, coverImage = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [Title, tags, seo, writer, ArticleText, coverImage, id];
    } else {
      sql = `
        UPDATE Article
        SET Title = ?, tags = ?, seo = ?, writer = ?, ArticleText = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [Title, tags, seo, writer, ArticleText, id];
    }

    await db.query(sql, params);

    res.json({ message: "Article updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update article" });
  }
};

// Soft delete
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "UPDATE Article SET isActive = 0 WHERE id = ?";
    await db.query(sql, [id]);

    res.json({ message: "Article soft deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete article" });
  }
};
