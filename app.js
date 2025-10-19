const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const anonId = require('./middleware/anonId');

dotenv.config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use(cookieParser());
app.use(anonId);

app.use(cors({
  origin: ['http://localhost:5501','http://127.0.0.1:5501','https://masailworld.com'],
  credentials: true
}));
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

