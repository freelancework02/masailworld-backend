const express = require("express");
const router = express.Router();
const multer = require("multer");
const articleController = require("../controllers/articleController");

// Multer setup: store file in memory (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create article with image
router.post("/", upload.single("coverImage"), articleController.createArticle);

// Read
router.get("/", articleController.getAllArticles); // ?limit=10&offset=0
router.get("/:id", articleController.getArticleById);
router.get("/:id/image", articleController.getArticleImage); // get only cover image

// Update (with optional image)
router.put("/:id", upload.single("coverImage"), articleController.updateArticle);

// Delete (soft delete)
router.delete("/:id", articleController.deleteArticle);

module.exports = router;
