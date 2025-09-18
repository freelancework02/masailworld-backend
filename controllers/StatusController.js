// controllers/statsController.js
const pool = require('../db');

/**
 * Safe list of tables we service and the key names the API returns
 * and the exact label column to use for "latest".
 */
const TABLES = [
  { name: 'Article', key: 'articles', labelCol: 'Title' },
  { name: 'Books', key: 'books', labelCol: 'BookName' },
  { name: 'fatawa', key: 'fatawa', labelCol: 'Title' },
  { name: 'NewAleemKiEntry', key: 'ulema', labelCol: 'Name' },
  { name: 'Tags', key: 'tags', labelCol: 'Name' },
  { name: 'User', key: 'users', labelCol: 'Name' }
];

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

/**
 * GET /api/stats/totals
 */
exports.getTotals = async (req, res) => {
  try {
    const countPromises = TABLES.map(t =>
      runQuery(`SELECT COUNT(*) AS count FROM \`${t.name}\``)
    );
    const results = await Promise.all(countPromises);

    const counts = {};
    TABLES.forEach((t, idx) => {
      const rows = results[idx];
      const count = Array.isArray(rows) && rows[0] && (rows[0].count ?? rows[0].COUNT)
        ? (rows[0].count ?? rows[0].COUNT)
        : 0;
      counts[t.key] = Number(count) || 0;
    });

    res.json({ success: true, counts });
  } catch (error) {
    console.error('Error in getTotals:', error);
    res.status(500).json({ success: false, error: 'Server error fetching totals' });
  }
};

/**
 * GET /api/stats/latest
 * For each table: try to SELECT id, label, created_at. If that fails (missing columns),
 * fallback to selecting only id and label.
 */
exports.getLatest = async (req, res) => {
  try {
    // For each table, perform a query attempt with created_at, else fallback
    const queries = TABLES.map(async (t) => {
      // Safe backtick-quoted column/table names
      const labelCol = `\`${t.labelCol}\``;
      const tableName = `\`${t.name}\``;

      // First attempt: include created_at/date via COALESCE (may fail if columns don't exist)
      const richQuery = `
        SELECT id,
               ${labelCol} AS label,
               COALESCE(\`created_at\`, \`date\`, NULL) AS created_at
        FROM ${tableName}
        ORDER BY id DESC
        LIMIT 1
      `;

      // Fallback: only id + label
      const simpleQuery = `
        SELECT id,
               ${labelCol} AS label
        FROM ${tableName}
        ORDER BY id DESC
        LIMIT 1
      `;

      try {
        const rows = await runQuery(richQuery);
        // rows may be [] if table empty
        return { table: t.name, key: t.key, row: (Array.isArray(rows) && rows[0]) ? rows[0] : null };
      } catch (err) {
        // Likely a missing column error — log and try simple query
        console.warn(`Query error for table ${t.name} (rich query), falling back to simple. Error:`, err && err.message);
        try {
          const rows2 = await runQuery(simpleQuery);
          return { table: t.name, key: t.key, row: (Array.isArray(rows2) && rows2[0]) ? rows2[0] : null };
        } catch (err2) {
          // both queries failed — return null row but keep service running
          console.error(`Query error for table ${t.name} (simple query failed):`, err2 && err2.message);
          return { table: t.name, key: t.key, row: null };
        }
      }
    });

    const rawResults = await Promise.all(queries);

    const latest = rawResults.map(r => {
      if (!r.row) return { table: r.table, key: r.key, item: null };
      return {
        table: r.table,
        key: r.key,
        item: {
          id: r.row.id,
          label: (r.row.label ?? null),
          created_at: (r.row.created_at ?? null) // may be undefined if fallback used
        }
      };
    });

    res.json({ success: true, latest });
  } catch (error) {
    console.error('Error in getLatest:', error);
    res.status(500).json({ success: false, error: 'Server error fetching latest items' });
  }
};
