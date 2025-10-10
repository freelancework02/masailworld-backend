// controllers/statsController.js
const pool = require('../db'); // Adjust path if your db.js is inside /config

/**
 * Safe list of tables we service and the key names the API returns,
 * with the exact label column to use for "latest".
 */
const TABLES = [
  { name: 'Article', key: 'articles', labelCol: 'Title' },
  { name: 'Books', key: 'books', labelCol: 'BookName' },
  { name: 'fatawa', key: 'fatawa', labelCol: 'Title' },
  { name: 'NewAleemKiEntry', key: 'ulema', labelCol: 'Name' },
  { name: 'Tags', key: 'tags', labelCol: 'Name' },
  { name: 'User', key: 'users', labelCol: 'Name' },
];

/**
 * Helper function to safely run a query and catch errors gracefully.
 */
async function safeQuery(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

/**
 * GET /api/stats/totals
 * Returns counts for all tables in TABLES[]
 */
exports.getTotals = async (req, res) => {
  try {
    // Run all count queries in parallel
    const countPromises = TABLES.map((t) =>
      pool.query(`SELECT COUNT(*) AS count FROM \`${t.name}\``)
    );

    const results = await Promise.all(countPromises);

    // Build structured counts
    const counts = {};
    TABLES.forEach((t, idx) => {
      const [rows] = results[idx];
      const count =
        Array.isArray(rows) && rows[0] && (rows[0].count ?? rows[0].COUNT)
          ? rows[0].count ?? rows[0].COUNT
          : 0;
      counts[t.key] = Number(count) || 0;
    });

    res.json({ success: true, counts });
  } catch (error) {
    console.error('❌ Error in getTotals:', error);
    res
      .status(500)
      .json({ success: false, error: 'Server error fetching totals' });
  }
};

/**
 * GET /api/stats/latest
 * For each table, get the most recent entry (id, label, created_at if exists)
 */
exports.getLatest = async (req, res) => {
  try {
    const queries = TABLES.map(async (t) => {
      const labelCol = `\`${t.labelCol}\``;
      const tableName = `\`${t.name}\``;

      const richQuery = `
        SELECT id,
               ${labelCol} AS label,
               COALESCE(\`created_at\`, \`date\`, NULL) AS created_at
        FROM ${tableName}
        ORDER BY id DESC
        LIMIT 1
      `;

      const simpleQuery = `
        SELECT id,
               ${labelCol} AS label
        FROM ${tableName}
        ORDER BY id DESC
        LIMIT 1
      `;

      try {
        const [rows] = await pool.query(richQuery);
        return {
          table: t.name,
          key: t.key,
          row: rows && rows[0] ? rows[0] : null,
        };
      } catch (err) {
        console.warn(
          `⚠️ Query error for table ${t.name} (rich query), falling back:`,
          err.message
        );

        try {
          const [rows2] = await pool.query(simpleQuery);
          return {
            table: t.name,
            key: t.key,
            row: rows2 && rows2[0] ? rows2[0] : null,
          };
        } catch (err2) {
          console.error(
            `❌ Query error for table ${t.name} (simple query failed):`,
            err2.message
          );
          return { table: t.name, key: t.key, row: null };
        }
      }
    });

    const rawResults = await Promise.all(queries);

    const latest = rawResults.map((r) => ({
      table: r.table,
      key: r.key,
      item: r.row
        ? {
            id: r.row.id,
            label: r.row.label ?? null,
            created_at: r.row.created_at ?? null,
          }
        : null,
    }));

    res.json({ success: true, latest });
  } catch (error) {
    console.error('❌ Error in getLatest:', error);
    res
      .status(500)
      .json({ success: false, error: 'Server error fetching latest items' });
  }
};
