const db = require('../db');

// Create a new fatwa
exports.createFatwa = (req, res) => {
  const {
    Title,
    Slug,
    Tags,
    Description,
    Question,
    Answer,
    Writer,
    TopicID,
    TopicName,
    CreatedByID,
    CreatedByUsername
  } = req.body;

  const query = `
    INSERT INTO Fatwa 
      (Title, Slug, Tags, Description, Question, Answer, Writer, TopicID, TopicName, CreatedByID, CreatedByUsername)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [Title, Slug, Tags, Description, Question, Answer, Writer, TopicID, TopicName, CreatedByID, CreatedByUsername],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, message: 'Fatwa created', fatwaId: result.insertId });
    }
  );
};

// Get all fatwas with topic info
exports.getAllFatwas = (req, res) => {
  const query = `
    SELECT FatwaID, Title, Slug, Tags, Description, Question, Answer, Writer,
           TopicID, TopicName, InsertedDate, ModifiedDate
    FROM Fatwa
    ORDER BY FatwaID DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: results });
  });
};

// Get fatwa by ID including topic info
exports.getFatwaById = (req, res) => {
  const { id } = req.params;

  console.log("Fetching fatwa with ID:", id);

  const query = `
    SELECT *
    FROM Fatwa
    WHERE FatwaID = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    console.log("Fatwa Results:", results);

    if (results.length === 0)
      return res.status(404).json({ success: false, message: 'Fatwa not found' });

    res.json({ success: true, data: results[0] });
  });
};

// Update fatwa by ID including topic fields
exports.updateFatwa = (req, res) => {
  const { id } = req.params;
  const {
    Title,
    Slug,
    Tags,
    Description,
    Question,
    Answer,
    Writer,
    TopicID,
    TopicName,
    UpdatedByID,
    UpdatedByUsername
  } = req.body;

  const query = `
    UPDATE Fatwa
    SET Title = ?, Slug = ?, Tags = ?, Description = ?, Question = ?, Answer = ?, Writer = ?, TopicID = ?, TopicName = ?, UpdatedByID = ?, UpdatedByUsername = ?, ModifiedDate = NOW()
    WHERE FatwaID = ?
  `;

  db.query(
    query,
    [Title, Slug, Tags, Description, Question, Answer, Writer, TopicID, TopicName, UpdatedByID, UpdatedByUsername, id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, message: 'Fatwa updated' });
    }
  );
};

// Delete fatwa by ID
exports.deleteFatwa = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM Fatwa WHERE FatwaID = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: 'Fatwa deleted' });
  });
};
