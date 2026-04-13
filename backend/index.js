const express = require('express');
const cors = require('cors');

// Initialize DB (runs CREATE TABLE IF NOT EXISTS on startup)
require('./db/database');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/subjects',      require('./routes/subjects'));
app.use('/api/exams',         require('./routes/exams'));
app.use('/api/settings',      require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search',        require('./routes/search'));

// Health check
app.get('/api/test', (req, res) => res.json({ message: 'API working', status: 'ok' }));

app.listen(PORT, () => {
  console.log(`WeekFive server running on http://localhost:${PORT}`);
});
