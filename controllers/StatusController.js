// controllers/statsController.js
const pool = require('../db');

exports.getTotals = async (req, res) => {
  try {
    // Define queries to get counts from each table
    const tables = ['Article', 'Books', 'Fatwa', 'Topic', 'User', 'Writers', "Questions"];
    
    // Create an array of promises for count queries
    const countPromises = tables.map(table =>
      pool.query(`SELECT COUNT(*) AS count FROM ${table}`)
    );

    // Run all queries in parallel
    const results = await Promise.all(countPromises);

    // Extract counts from results
    const counts = {};
    tables.forEach((table, index) => {
      // For promisified mysql, result is rows array
      const rows = results[index];
      counts[table.toLowerCase()] = rows[0].count || 0;
    });

    // Respond with counts
    res.json({ success: true, counts });

  } catch (error) {
    console.error('Error fetching total counts:', error);
    res.status(500).json({ success: false, error: 'Server error fetching counts' });
  }
};
