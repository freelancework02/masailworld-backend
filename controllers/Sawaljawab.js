// controller/questionsController.js
const db = require('../db'); // Database connection

// Insert form data into QuestionsAnswers
exports.addQuestionAnswer = (req, res) => {
    const {
        FullName,
        Email,
        WhatsAppNumber,
        CountryCity,
        Question,
        Answer,
        ReferenceAndDate,
        CorrectedReference,
        DarulIftaName,
        AnswerDate,
        Rating,
        Category,
        Topic,
        IsDelete,
        Approved
    } = req.body;

    const sql = `
        INSERT INTO QuestionsAnswers (
            FullName, Email, WhatsAppNumber, CountryCity, Question, Answer,
            ReferenceAndDate, CorrectedReference, DarulIftaName, AnswerDate,
            Rating, Category, Topic, IsDelete, Approved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        FullName,
        Email,
        WhatsAppNumber,
        CountryCity,
        Question,
        Answer,
        ReferenceAndDate,
        CorrectedReference,
        DarulIftaName,
        AnswerDate,
        Rating,
        Category,
        Topic,
        IsDelete || 0,
        Approved || 0
    ], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ error: 'Database insert failed' });
        }
        res.status(201).json({ message: 'Form data inserted successfully', id: result.insertId });
    });
};



// Get all non-deleted questions & answers
exports.getQuestionsAnswers = (req, res) => {
    const sql = `
        SELECT * 
        FROM QuestionsAnswers
        WHERE IsDelete = 0
        ORDER BY ID DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: 'Database fetch failed' });
        }
        res.status(200).json(results);
    });
};
