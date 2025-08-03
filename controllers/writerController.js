const db = require('../db');

// Get all writers (excluding the photo blob)
exports.getAllWriters = (req, res) => {
  db.query(
    'SELECT WriterID, WriterName, Position, WriterBio, CreatedByID, CreatedByUsername FROM Writers',
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
    const { WriterName, Position, WriterBio, CreatedByID, CreatedByUsername } = req.body;
    const Photo = req.file ? req.file.buffer : null;

    if (!CreatedByID || !CreatedByUsername) {
        return res.status(400).json({ error: 'CreatedByID and CreatedByUsername are required.' });
    }

    db.query(
        'INSERT INTO Writers (WriterName, Position, WriterBio, Photo, CreatedByID, CreatedByUsername) VALUES (?, ?, ?, ?, ?, ?)',
        [WriterName, Position, WriterBio, Photo, CreatedByID, CreatedByUsername],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, message: 'Writer created' });
        }
    );
};


// Update writer (partial update, photo optional)
exports.updateWriter = (req, res) => {
    const { id } = req.params;
    const { WriterName, Position, WriterBio, UpdatedByID, UpdatedByUsername } = req.body;
    const fields = [];
    const values = [];

    if (WriterName !== undefined) {
        fields.push('WriterName = ?');
        values.push(WriterName);
    }
    if (Position !== undefined) {
        fields.push('Position = ?');
        values.push(Position);
    }
    if (WriterBio !== undefined) {
        fields.push('WriterBio = ?');
        values.push(WriterBio);
    }
    if (UpdatedByID !== undefined) {
        fields.push('UpdatedByID = ?');
        values.push(UpdatedByID);
    }
    if (UpdatedByUsername !== undefined) {
        fields.push('UpdatedByUsername = ?');
        values.push(UpdatedByUsername);
    }
    if (req.file) {
        fields.push('Photo = ?');
        values.push(req.file.buffer);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    // Optionally add updated timestamp
    fields.push('UpdatedAt = NOW()');

    values.push(id);

    const sql = `UPDATE Writers SET ${fields.join(', ')} WHERE WriterID = ?`;

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Writer not found.' });
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
