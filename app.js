const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Remove static uploads middleware (no file storage needed)
// app.use('/uploads', express.static('uploads'));

app.use('/api/fatwa', require('./routes/fatwaRoutes'));
app.use('/api/article', require('./routes/articleRoutes'));
app.use('/api/book', require('./routes/bookRoutes'));
app.use('/api/writer', require('./routes/writerRoutes'));
app.use('/api/topic', require('./routes/topicRoutes'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
