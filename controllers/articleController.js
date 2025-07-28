const db = require('../db');

exports.getAllArticles = (req, res) => {
  db.query('SELECT * FROM Article', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.createArticle = (req, res) => {
  const { Title, Slug, Tags, Description, Writer, FeaturedImage, ArticleDescription } = req.body;
  db.query(
    'INSERT INTO Article (Title, Slug, Tags, Description, Writer, FeaturedImage, ArticleDescription) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [Title, Slug, Tags, Description, Writer, FeaturedImage, ArticleDescription],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Article created', id: result.insertId });
    }
  );
};
