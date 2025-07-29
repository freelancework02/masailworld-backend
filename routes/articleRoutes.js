const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

const multer = require('multer');

// Store image in memory (no files on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);
router.get('/image/:id', articleController.getArticleImage);

// Create article (with optional image upload in memory)
router.post('/', upload.single('FeaturedImage'), articleController.createArticle);

// Update article (PATCH is more RESTful for partial update)
router.patch('/:id', upload.single('FeaturedImage'), articleController.updateArticle);

// Hard delete
router.delete('/:id', articleController.deleteArticle);

module.exports = router;
