const db = require('../db');

exports.getAllBooks = (req, res) => {
  db.query('SELECT * FROM Books', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.createBook = (req, res) => {
  const { BookName, Author, BookCover, PDFFile } = req.body;
  db.query(
    'INSERT INTO Books (BookName, Author, BookCover, PDFFile) VALUES (?, ?, ?, ?)',
    [BookName, Author, BookCover, PDFFile],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Book created', id: result.insertId });
    }
  );
};
