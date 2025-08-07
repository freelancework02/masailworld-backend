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



// UPDATE topic (partial, by ID)
exports.updateTopic = (req, res) => {
  const { id } = req.params;
  const { TopicName, IconClass } = req.body;
  const fields = [];
  const values = [];

  if (TopicName !== undefined) {
    fields.push('TopicName = ?');
    values.push(TopicName);
  }
  if (IconClass !== undefined) {
    fields.push('IconClass = ?');
    values.push(IconClass);
  }

  if (!fields.length) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);
  db.query(
    `UPDATE Topic SET ${fields.join(', ')} WHERE TopicID = ?`,
    values,
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Topic not found' });
      res.json({ message: 'Topic updated' });
    }
  );
};



exports.getTopicById = (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT * FROM Topic WHERE TopicID = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results.length) return res.status(404).json({ error: 'Topic not found' });
      res.json(results[0]);
    }
  );
};


// Get Topic by Limit and offset 
exports.getTopicsPaged = (req, res) => {
  // Parse and validate limit and offset from query params, provide defaults
  let limit = parseInt(req.query.limit, 10);
  let offset = parseInt(req.query.offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10; // default limit
  if (isNaN(offset) || offset < 0) offset = 0; // default offset

  db.query(
    'SELECT * FROM Topic ORDER BY TopicID ASC LIMIT ? OFFSET ?',
    [limit, offset],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
};
