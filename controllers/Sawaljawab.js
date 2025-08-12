// controllers/Sawaljawab.js
const db = require('../db');

// Get all active
exports.getQuestionsAnswers = (req, res) => {
    const sql = `SELECT * FROM QuestionsAnswers WHERE IsDelete = 0 ORDER BY ID DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get single
exports.getQuestionAnswerById = (req, res) => {
    const sql = `SELECT * FROM QuestionsAnswers WHERE ID = ? AND IsDelete = 0 LIMIT 1`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!results.length) return res.status(404).json({ error: 'Not found' });
        res.json(results[0]);
    });
};

// Add
exports.addQuestionAnswer = (req, res) => {
    const data = req.body;
    const sql = `
      INSERT INTO QuestionsAnswers
      (FullName, Email, WhatsAppNumber, CountryCity, Question, Answer,
       ReferenceAndDate, CorrectedReference, DarulIftaName, AnswerDate,
       Rating, Category, Topic, IsDelete, Approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `;
    db.query(sql, [
        data.FullName, data.Email, data.WhatsAppNumber, data.CountryCity,
        data.Question, data.Answer, data.ReferenceAndDate, data.CorrectedReference,
        data.DarulIftaName, data.AnswerDate, data.Rating, data.Category, data.Topic
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, message: 'Added successfully' });
    });
};

// Update
exports.updateQuestionAnswer = (req, res) => {
    const data = req.body;
    const sql = `
      UPDATE QuestionsAnswers SET
      FullName=?, Email=?, WhatsAppNumber=?, CountryCity=?, Question=?, Answer=?,
      ReferenceAndDate=?, CorrectedReference=?, DarulIftaName=?, AnswerDate=?,
      Rating=?, Category=?, Topic=?, Approved=?
      WHERE ID=? AND IsDelete=0
    `;
    db.query(sql, [
        data.FullName, data.Email, data.WhatsAppNumber, data.CountryCity,
        data.Question, data.Answer, data.ReferenceAndDate, data.CorrectedReference,
        data.DarulIftaName, data.AnswerDate, data.Rating, data.Category, data.Topic,
        data.Approved || 0, req.params.id
    ], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Updated successfully' });
    });
};

// Approve
exports.approveQuestionAnswer = (req, res) => {
    db.query(`UPDATE QuestionsAnswers SET Approved=1 WHERE ID=?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Approved successfully' });
    });
};

// Delete (soft delete)
exports.deleteQuestionAnswer = (req, res) => {
    db.query(`UPDATE QuestionsAnswers SET IsDelete=1 WHERE ID=?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};
