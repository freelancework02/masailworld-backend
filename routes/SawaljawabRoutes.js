// routes/questionsRoutes.js
const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/Sawaljawab');


// GET - Fetch all non-deleted records
router.get('/all', questionsController.getQuestionsAnswers);


// POST - Add question and answer
router.post('/add', questionsController.addQuestionAnswer);

module.exports = router;



