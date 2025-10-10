const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// ------------------- Routes -------------------
app.use('/api/fatwa', require('./routes/fatwaRoutes'));
app.use('/api/article', require('./routes/articleRoutes'));
app.use('/api/book', require('./routes/bookRoutes'));
// app.use('/api/writer', require('./routes/writerRoutes'));
// app.use('/api/topic', require('./routes/topicRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stats', require('./routes/statusRoutes'));
app.use('/api/questions', require('./routes/questionsRoutes'));
app.use('/questions', require('./routes/SawaljawabRoutes'));
app.use('/api/activity', require("./routes/activityRoutes.js"));

// Newly added routes
app.use('/api/aleem', require('./routes/aleemRoutes.js'));   // 👳 UlmaeKaram entries
app.use('/api/tags', require('./routes/tagRoutes'));       // 🏷️ Tags
// app.use('/api/user', require('./routes/userRoutes'));       // 👤 User (insert, get all names, get by id)

// ------------------- Server -------------------
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});

