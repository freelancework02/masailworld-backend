const db = require('../db');

exports.getAllWriters = (req, res) => {
  db.query('SELECT * FROM Writers', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.createWriter = (req, res) => {
  const { WriterName, Position, Photo, WriterBio } = req.body;
  db.query(
    'INSERT INTO Writers (WriterName, Position, Photo, WriterBio) VALUES (?, ?, ?, ?)',
    [WriterName, Position, Photo, WriterBio],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Writer created', id: result.insertId });
    }
  );
};
