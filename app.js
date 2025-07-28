// app.js
const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 5000;

app.use(express.json());

// Routes
app.use('/api/fatwa', require('./routes/fatwaRoutes'));
app.use('/api/article', require('./routes/articleRoutes'));
app.use('/api/book', require('./routes/bookRoutes'));
app.use('/api/writer', require('./routes/writerRoutes'));
app.use('/api/topic', require('./routes/topicRoutes'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
