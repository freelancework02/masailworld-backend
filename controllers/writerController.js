const db = require('../db');

// Get all writers (excluding the photo blob)
exports.getAllWriters = (req, res) => {
  db.query(
    'SELECT WriterID, WriterName, Position, WriterBio FROM Writers',
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
};

// Get single writer by ID (excluding photo)
exports.getWriterById = (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT WriterID, WriterName, Position, WriterBio FROM Writers WHERE WriterID = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results.length) return res.status(404).json({ error: 'Writer not found' });
      res.json(results[0]);
    }
  );
};

// Get writer photo (image blob) by ID
exports.getWriterImage = (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT Photo FROM Writers WHERE WriterID = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results.length || !results[0].Photo) {
        return res.status(404).json({ error: 'Image not found' });
      }
      res.set('Content-Type', 'image/jpeg'); // Adjust if your photos have different formats
      res.send(results[0].Photo);
    }
  );
};

// Create new writer with photo buffer
exports.createWriter = (req, res) => {
  const { WriterName, Position, WriterBio } = req.body;
  const Photo = req.file ? req.file.buffer : null;

  db.query(
    'INSERT INTO Writers (WriterName, Position, Photo, WriterBio) VALUES (?, ?, ?, ?)',
    [WriterName, Position, Photo, WriterBio],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Writer created', id: result.insertId });
    }
  );
};

// Update writer (partial update, photo optional)
exports.updateWriter = (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  ['WriterName', 'Position', 'WriterBio'].forEach((field) => {
    if (req.body[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (req.file) {
    fields.push('Photo = ?');
    values.push(req.file.buffer);
  }

  if (!fields.length) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);
  const sql = `UPDATE Writers SET ${fields.join(', ')} WHERE WriterID = ?`;

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Writer not found' });
    res.json({ message: 'Writer updated' });
  });
};

// Delete a writer record
exports.deleteWriter = (req, res) => {
  const { id } = req.params;
  db.query(
    'DELETE FROM Writers WHERE WriterID = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Writer not found' });
      res.json({ message: 'Writer deleted' });
    }
  );
};
