const db = require("../config/db");

// ✅ Create book (with cover + pdf)
exports.createBook = async (req, res) => {
  try {
    const { BookName, BookWriter, BookDescription } = req.body;

    const coverFile = req.files?.["BookCoverImg"]?.[0] || null;
    const pdfFile = req.files?.["BookPDF"]?.[0] || null;

    const coverBuffer = coverFile ? coverFile.buffer : null;
    const pdfBuffer = pdfFile ? pdfFile.buffer : null;
    const coverType = coverFile ? coverFile.mimetype : null;

    const sql = `
      INSERT INTO Books (BookName, BookWriter, BookDescription, BookCoverImg, BookCoverType, BookPDF, isActive)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(sql, [
      BookName,
      BookWriter || null,
      BookDescription || null,
      coverBuffer,
      coverType,
      pdfBuffer,
    ]);

    res.status(201).json({
      message: "✅ Book created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error creating book:", error);
    res.status(500).json({ error: "Failed to create book" });
  }
};

// ✅ Get all books (without heavy BLOBs)
exports.getAllBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const sql = `
      SELECT id, BookName, BookWriter, BookDescription, isActive
      FROM Books
      WHERE isActive = 1
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(sql, [limit, offset]);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

// ✅ Get book by ID (without blobs)
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, BookName, BookWriter, BookDescription, isActive
      FROM Books
      WHERE id = ? AND isActive = 1
    `;

    const [rows] = await db.query(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
};

// ✅ Get book cover by ID
exports.getBookCoverById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
     SELECT BookCoverImg FROM Books WHERE id = ? AND isActive = 1
    `;

    const [rows] = await db.query(sql, [id]);

    if (!rows.length || !rows[0].BookCoverImg) {
      return res.status(404).json({ error: "Book cover not found" });
    }

    const imageBuffer = rows[0].BookCoverImg;
    const mimeType = rows[0].BookCoverType || "image/jpeg";

    res.set({
      "Content-Type": mimeType,
      "Content-Length": imageBuffer.length,
    });

    res.end(imageBuffer);
  } catch (error) {
    console.error("❌ Error fetching book cover:", error);
    res.status(500).json({ error: "Failed to fetch book cover" });
  }
};

// ✅ Get book PDF by ID
exports.getBookPdfById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT BookPDF
      FROM Books
      WHERE id = ? AND isActive = 1
    `;

    const [rows] = await db.query(sql, [id]);

    if (!rows.length || !rows[0].BookPDF) {
      return res.status(404).json({ error: "Book PDF not found" });
    }

    const pdfBuffer = rows[0].BookPDF;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=book.pdf",
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (error) {
    console.error("❌ Error fetching book PDF:", error);
    res.status(500).json({ error: "Failed to fetch book PDF" });
  }
};

// ✅ Update book (with optional new cover/pdf)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { BookName, BookWriter, BookDescription } = req.body;

    const coverFile = req.files?.["BookCoverImg"]?.[0] || null;
    const pdfFile = req.files?.["BookPDF"]?.[0] || null;

    const coverBuffer = coverFile ? coverFile.buffer : null;
    const pdfBuffer = pdfFile ? pdfFile.buffer : null;
    const coverType = coverFile ? coverFile.mimetype : null;

    let sql = "";
    let params = [];

    if (coverBuffer && pdfBuffer) {
      sql = `
        UPDATE Books
        SET BookName = ?, BookWriter = ?, BookDescription = ?, BookCoverImg = ?, BookCoverType = ?, BookPDF = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [BookName, BookWriter, BookDescription, coverBuffer, coverType, pdfBuffer, id];
    } else if (coverBuffer) {
      sql = `
        UPDATE Books
        SET BookName = ?, BookWriter = ?, BookDescription = ?, BookCoverImg = ?, BookCoverType = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [BookName, BookWriter, BookDescription, coverBuffer, coverType, id];
    } else if (pdfBuffer) {
      sql = `
        UPDATE Books
        SET BookName = ?, BookWriter = ?, BookDescription = ?, BookPDF = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [BookName, BookWriter, BookDescription, pdfBuffer, id];
    } else {
      sql = `
        UPDATE Books
        SET BookName = ?, BookWriter = ?, BookDescription = ?
        WHERE id = ? AND isActive = 1
      `;
      params = [BookName, BookWriter, BookDescription, id];
    }

    const [result] = await db.query(sql, params);

    res.json({
      message: "✅ Book updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Error updating book:", error);
    res.status(500).json({ error: "Failed to update book" });
  }
};

// ✅ Soft delete book
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("UPDATE Books SET isActive = 0 WHERE id = ?", [id]);

    res.json({
      message: "🗑️ Book soft deleted successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Error deleting book:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
};
