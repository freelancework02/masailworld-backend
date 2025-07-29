const db = require('../db');

// Fetch ALL articles (excluding the image buffer)
exports.getAllArticles = (req, res) => {
  db.query(
    'SELECT ArticleID, Title, Slug, Tags, Description, Writer, ArticleDescription, InsertedDate FROM Article',
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
    'SELECT ArticleID, Title, Slug, Tags, Description, Writer, ArticleDescription FROM Article WHERE ArticleID = ?',
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
exports.createArticle = (req, res) => {
  const { Title, Slug, Tags, Description, Writer, ArticleDescription } = req.body;
  const FeaturedImage = req.file ? req.file.buffer : null;
  db.query(
    'INSERT INTO Article (Title, Slug, Tags, Description, Writer, FeaturedImage, ArticleDescription) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [Title, Slug, Tags, Description, Writer, FeaturedImage, ArticleDescription],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Article created', id: result.insertId });
    }
  );
};

// UPDATE article, including image (optional)
exports.updateArticle = (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  // Only update fields provided in request body or file
  ['Title', 'Slug', 'Tags', 'Description', 'Writer', 'ArticleDescription'].forEach((key) => {
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
