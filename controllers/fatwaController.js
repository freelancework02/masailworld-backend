const db = require('../db');

// Create a new fatwa
exports.createFatwa = (req, res) => {
  const { Title, Slug, Tags, Description, Question, Answer, Writer } = req.body;

  const query = `
    INSERT INTO Fatwa (Title, Slug, Tags, Description, Question, Answer, Writer)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [Title, Slug, Tags, Description, Question, Answer, Writer], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: 'Fatwa created', id: result.insertId });
  });
};

// Get all fatwas
exports.getAllFatwas = (req, res) => {
  const query = `
    SELECT FatwaID, Title, Slug, Tags, Description, Question, Answer, Writer,
           InsertedDate, ModifiedDate
    FROM Fatwa
    ORDER BY FatwaID DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: results });
  });
};

// Get fatwa by ID
exports.getFatwaById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM Fatwa WHERE FatwaID = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Fatwa not found' });
    res.json({ success: true, data: results[0] });
  });
};

// Update fatwa by ID
exports.updateFatwa = (req, res) => {
  const { id } = req.params;
  const { Title, Slug, Tags, Description, Question, Answer, Writer } = req.body;

  const query = `
    UPDATE Fatwa
    SET Title = ?, Slug = ?, Tags = ?, Description = ?, Question = ?, Answer = ?, Writer = ?
    WHERE FatwaID = ?
  `;

  db.query(query, [Title, Slug, Tags, Description, Question, Answer, Writer, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: 'Fatwa updated' });
  });
};

// Delete fatwa by ID
exports.deleteFatwa = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM Fatwa WHERE FatwaID = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: 'Fatwa deleted' });
  });
};
