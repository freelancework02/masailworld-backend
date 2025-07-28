const db = require('../db');

exports.getAllTopics = (req, res) => {
  db.query('SELECT * FROM Topic', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.createTopic = (req, res) => {
  const { TopicName, IconClass } = req.body;
  db.query(
    'INSERT INTO Topic (TopicName, IconClass) VALUES (?, ?)',
    [TopicName, IconClass],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Topic created', id: result.insertId });
    }
  );
};
