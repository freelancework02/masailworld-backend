const db = require('../db');

// Fetch ALL articles (excluding the image buffer)
exports.getAllArticles = (req, res) => {
  db.query(
    `SELECT ArticleID, Title, Slug, Tags, Description, Writer, ArticleDescription,
            InsertedDate, TopicName, TopicID, CreatedByID, CreatedByUsername,
            UpdatedByID, UpdatedByUsername, UpdatedAt, VIEW, likes
     FROM Article`,
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
};



// Fetch SINGLE article by ID (excluding the image buffer)
exports.getArticleById = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT ArticleID, Title, Slug, Tags, Description, Writer, ArticleDescription,
            TopicName, TopicID, CreatedByID, CreatedByUsername,
            UpdatedByID, UpdatedByUsername, UpdatedAt, VIEW, likes
    FROM Article WHERE ArticleID = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results.length) return res.status(404).json({ error: 'Article not found' });
      res.json(results[0]);
    }
  );
};


// Fetch image buffer by article ID
exports.getArticleImage = (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT FeaturedImage FROM Article WHERE ArticleID = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results.length || !results[0].FeaturedImage)
        return res.status(404).json({ error: 'Image not found' });
      // Set appropriate headers (assuming JPEG for sample)
      res.set('Content-Type', 'image/jpeg');
      res.send(results[0].FeaturedImage);
    }
  );
};

// Create NEW article, storing image buffer in DB
// Assuming you use multer in your route as middleware
// In articleController.js

exports.createArticle = (req, res) => {
  let {
    Title,
    Slug,
    Tags,
    Description,
    Writer,
    ArticleDescription,
    TopicID,
    TopicName,
    CreatedByID,
    CreatedByUsername
  } = req.body;

  const FeaturedImage = req.file ? req.file.buffer : null;

  if (!TopicName || TopicName.trim() === "") {
    return res.status(400).json({ error: "TopicName is required." });
  }
  if (!CreatedByID || !CreatedByUsername) {
    return res.status(400).json({ error: "CreatedByID and CreatedByUsername are required." });
  }

  db.query(
    `INSERT INTO Article
      (Title, Slug, Tags, Description, Writer, FeaturedImage, ArticleDescription, TopicID, TopicName, CreatedByID, CreatedByUsername)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Title,
      Slug,
      Tags,
      Description,
      Writer,
      FeaturedImage,
      ArticleDescription,
      TopicID || null,
      TopicName,
      CreatedByID,
      CreatedByUsername
    ],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Article created", id: result.insertId });
    }
  );
};



exports.updateArticle = (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  // "UpdatedByID" and "UpdatedByUsername" included!
  const updatableFields = [
    'Title', 'Slug', 'Tags', 'Description', 'Writer', 'ArticleDescription',
    'TopicName', 'TopicID', 'UpdatedByID', 'UpdatedByUsername'
  ];

  updatableFields.forEach((key) => {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  });

  if (req.file) {
    fields.push('FeaturedImage = ?');
    values.push(req.file.buffer);
  }

  if (!fields.length) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Always update timestamp if desired (if you have UpdatedAt column)
  fields.push('UpdatedAt = NOW()');

  values.push(id);

  const sql = `UPDATE Article SET ${fields.join(', ')} WHERE ArticleID = ?`;
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article updated' });
  });
};








// UPDATE article, including image (optional)
exports.updateArticle = (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  // Include TopicID along with TopicName
  ['Title', 'Slug', 'Tags', 'Description', 'Writer', 'ArticleDescription', 'TopicName', 'TopicID'].forEach((key) => {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  });

  if (req.file) {
    fields.push('FeaturedImage = ?');
    values.push(req.file.buffer);
  }

  if (!fields.length) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);
  const sql = `UPDATE Article SET ${fields.join(', ')} WHERE ArticleID = ?`;
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article updated' });
  });
};


// DELETE article (hard delete; for soft delete, add isDeleted logic)
exports.deleteArticle = (req, res) => {
  const { id } = req.params;
  db.query(
    'DELETE FROM Article WHERE ArticleID = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Article not found' });
      res.json({ message: 'Article deleted' });
    }
  );
};


// Fetch articles with pagination (limit & offset, excluding image buffer)
exports.getArticlesByPage = (req, res) => {
  // Default to page 1 and 10 articles per page if not provided
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  db.query(
    `SELECT ArticleID, Title, Slug, Tags, Description, Writer, ArticleDescription,
            InsertedDate, TopicName, TopicID, CreatedByID, CreatedByUsername,
            UpdatedByID, UpdatedByUsername, UpdatedAt, VIEW, likes
     FROM Article
     ORDER BY InsertedDate DESC
     LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
};
