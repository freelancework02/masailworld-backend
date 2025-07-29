// controllers/fatwaController.js
const db = require('../db');



exports.createFatwa = (req, res) => {
  const { Title, Slug, Keywords, Description, Question, Answer, Writer } = req.body;
  db.query(
    'INSERT INTO Fatwa (Title, Slug, Tags, Description, Question, Answer, Writer) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [Title, Slug, Keywords, Description, Question, Answer, Writer],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Fatwa created', id: result.insertId });
    }
  );
};
