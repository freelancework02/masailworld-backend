// db.js
const mysql = require('mysql2/promise'); 
const dotenv = require('dotenv');
dotenv.config();

// Use a pool to manage multiple connections efficiently
const pool = mysql.createPool({
  connectionLimit: 10,                  // Adjust based on your expected load
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306                            // Use 3306 for MySQL, not 5000
});

// Test the connection pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL pool:', err.message);
    process.exit(1);
  } else {
    console.log('✅ MySQL pool connected successfully!');
    connection.release(); // Important: release the connection back to the pool
  }
});

module.exports = pool;
