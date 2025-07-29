const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const multer = require('multer');

// Multer config to store files in memory (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all books (no blobs)
router.get('/', bookController.getAllBooks);

// GET one book (no blobs)
router.get('/:id', bookController.getBookById);

// GET BookCover by BookID (returns image blob)
router.get('/cover/:id', bookController.getBookCover);

// GET PDFFile by BookID (returns PDF blob)
router.get('/pdf/:id', bookController.getBookPdf);

// CREATE: Accept BookCover and PDFFile as blobs in memory
router.post(
  '/',
  upload.fields([
    { name: 'BookCover', maxCount: 1 },
    { name: 'PDFFile', maxCount: 1 }
  ]),
  bookController.createBook
);

// UPDATE: Accept BookCover/PDFFile replacement (partial or full)
router.patch(
  '/:id',
  upload.fields([
    { name: 'BookCover', maxCount: 1 },
    { name: 'PDFFile', maxCount: 1 }
  ]),
  bookController.updateBook
);

// DELETE
router.delete('/:id', bookController.deleteBook);

module.exports = router;
