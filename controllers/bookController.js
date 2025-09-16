const db = require("../config/db");

// Create book (with cover + pdf)
exports.createBook = async (req, res) => {
  try {
    const { BookName, BookWriter, BookDescription } = req.body;
    const coverFile = req.files["BookCoverImg"] ? req.files["BookCoverImg"][0].buffer : null;
    const pdfFile = req.files["BookPDF"] ? req.files["BookPDF"][0].buffer : null;

    const sql = `
      INSERT INTO Books (BookName, BookWriter, BookDescription, BookCoverImg, BookPDF, isActive)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    const result = await db.query(sql, [
      BookName,
      BookWriter || null,
      BookDescription || null,
      coverFile,
      pdfFile,
    ]);

    res.status(201).json({ message: "Book created successfully", id: result.insertId });
  } catch (error) {
    console.error("❌ Error creating book:", error);
    res.status(500).json({ error: "Failed to create book" });
  }
};

// Get all books (without heavy BLOBs)
exports.getAllBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const sql = `
      SELECT id, BookName, BookWriter, BookDescription, isActive
      FROM Books WHERE isActive = 1
      LIMIT ? OFFSET ?
    `;

    const rows = await db.query(sql, [limit, offset]);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

// Get book by ID (without blobs)
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, BookName, BookWriter, BookDescription, isActive
      FROM Books WHERE id = ? AND isActive = 1
    `;
    const rows = await db.query(sql, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Book not found" });

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
};

// Get book cover by ID
exports.getBookCoverById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "SELECT BookCoverImg FROM Books WHERE id = ? AND isActive = 1";
    const rows = await db.query(sql, [id]);

    if (rows.length === 0 || !rows[0].BookCoverImg) {
      return res.status(404).json({ error: "Book cover not found" });
    }

    res.set("Content-Type", "image/jpeg");
    res.send(rows[0].BookCoverImg);
  } catch (error) {
    console.error("❌ Error fetching book cover:", error);
    res.status(500).json({ error: "Failed to fetch book cover" });
  }
};

// Get book PDF by ID
exports.getBookPdfById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "SELECT BookPDF FROM Books WHERE id = ? AND isActive = 1";
    const rows = await db.query(sql, [id]);

    if (rows.length === 0 || !rows[0].BookPDF) {
      return res.status(404).json({ error: "Book PDF not found" });
    }

    res.set("Content-Type", "application/pdf");
    res.send(rows[0].BookPDF);
  } catch (error) {
    console.error("❌ Error fetching book PDF:", error);
    res.status(500).json({ error: "Failed to fetch book PDF" });
  }
};

// Update book (with optional new cover/pdf)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { BookName, BookWriter, BookDescription } = req.body;
    const coverFile = req.files["BookCoverImg"] ? req.files["BookCoverImg"][0].buffer : null;
    const pdfFile = req.files["BookPDF"] ? req.files["BookPDF"][0].buffer : null;

    let sql, params;

    if (coverFile && pdfFile) {
      sql = `
        UPDATE Books
        SET BookName = ?, BookWriter = ?, BookDescription = ?, BookCoverImg = ?, BookPDF = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [BookName, BookWriter, BookDescription, coverFile, pdfFile, id];
    } else if (coverFile) {
      sql = `
        UPDATE Books
        SET BookName = ?, BookWriter = ?, BookDescription = ?, BookCoverImg = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [BookName, BookWriter, BookDescription, coverFile, id];
    } else if (pdfFile) {
      sql = `
        UPDATE Books
        SET BookName = ?, BookWriter = ?, BookDescription = ?, BookPDF = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [BookName, BookWriter, BookDescription, pdfFile, id];
    } else {
      sql = `
        UPDATE Books
        SET BookName = ?, BookWriter = ?, BookDescription = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [BookName, BookWriter, BookDescription, id];
    }

    await db.query(sql, params);

    res.json({ message: "Book updated successfully" });
  } catch (error) {
    console.error("❌ Error updating book:", error);
    res.status(500).json({ error: "Failed to update book" });
  }
};

// Soft delete
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "UPDATE Books SET isActive = 0 WHERE id = ?";
    await db.query(sql, [id]);

    res.json({ message: "Book soft deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting book:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
};
