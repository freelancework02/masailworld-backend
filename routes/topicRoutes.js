const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/', topicController.getAllTopics);
router.post('/', topicController.createTopic);
router.patch('/:id', topicController.updateTopic); // PATCH for partial update

router.get('/:id', topicController.getTopicById);


module.exports = router;
