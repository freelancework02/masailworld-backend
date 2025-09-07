const db = require('../db');

// GET all books (excluding BookCover/PDFFile binary data)
exports.getAllBooks = (req, res) => {
  db.query(
    'SELECT BookID, BookName, Author, InsertedDate, TopicName, TopicID FROM Books',
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
};

// GET single book by ID (excluding BookCover/PDFFile binary data)
exports.getBookById = (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT BookID, BookName, Author, TopicName, TopicID FROM Books WHERE BookID = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results.length) return res.status(404).json({ error: 'Book not found' });
      res.json(results[0]);
    }
  );
};

// GET BookCover image blob by ID
exports.getBookCover = (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT BookCover FROM Books WHERE BookID = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results.length || !results[0].BookCover)
        return res.status(404).json({ error: 'Book cover not found' });
      res.set('Content-Type', 'image/jpeg'); // or detect mimetype
      res.send(results[0].BookCover);
    }
  );
};

// GET PDF file blob by ID
exports.getBookPdf = (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT PDFFile FROM Books WHERE BookID = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results.length || !results[0].PDFFile)
        return res.status(404).json({ error: 'PDF file not found' });
      res.set('Content-Type', 'application/pdf');
      res.send(results[0].PDFFile);
    }
  );
};

// CREATE book (store cover and PDF as blobs)

exports.createBook = (req, res) => {
  const { BookName, Author, TopicID, TopicName, CreatedByID, CreatedByUsername } = req.body;

  const BookCover = req.files && req.files['BookCover'] ? req.files['BookCover'][0].buffer : null;
  const PDFFile = req.files && req.files['PDFFile'] ? req.files['PDFFile'][0].buffer : null;

  if (!CreatedByID || !CreatedByUsername) {
    return res.status(400).json({ error: 'CreatedByID and CreatedByUsername are required.' });
  }

  const sql = `
    INSERT INTO Books
      (BookName, Author, BookCover, PDFFile, TopicName, TopicID, CreatedByID, CreatedByUsername)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [BookName, Author, BookCover, PDFFile, TopicName || null, TopicID || null, CreatedByID, CreatedByUsername],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Book created', id: result.insertId });
    }
  );
};


// UPDATE book (with optional blobs)

exports.updateBook = (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  const updatableFields = ['BookName', 'Author', 'TopicName', 'TopicID', 'UpdatedByID', 'UpdatedByUsername'];

  updatableFields.forEach((key) => {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  });

  if (req.files && req.files['BookCover']) {
    fields.push('BookCover = ?');
    values.push(req.files['BookCover'][0].buffer);
  }
  if (req.files && req.files['PDFFile']) {
    fields.push('PDFFile = ?');
    values.push(req.files['PDFFile'][0].buffer);
  }
  
  if (!fields.length) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Optionally update the UpdatedAt timestamp if desired
  fields.push('UpdatedAt = NOW()');

  values.push(id);

  const sql = `UPDATE Books SET ${fields.join(', ')} WHERE BookID = ?`;
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book updated' });
  });
};



// DELETE book
exports.deleteBook = (req, res) => {
  const { id } = req.params;
  db.query(
    'DELETE FROM Books WHERE BookID = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
      res.json({ message: 'Book deleted' });
    }
  );
};




// NEW: GET books with limit and optional offset
exports.getBooksPaginated = (req, res) => {
  let { limit, offset } = req.query;

  limit = parseInt(limit, 10);
  offset = offset !== undefined ? parseInt(offset, 10) : null;

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: 'Valid limit is required' });
  }

  let sql = `
    SELECT BookID, BookName, Author, InsertedDate, TopicName, TopicID
    FROM Books
    ORDER BY InsertedDate DESC
    LIMIT ?
  `;
  const values = [limit];

  if (offset !== null && !isNaN(offset) && offset >= 0) {
    sql += ' OFFSET ?';
    values.push(offset);
  }

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};