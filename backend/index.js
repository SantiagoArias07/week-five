const express = require('express');
const cors = require('cors');

// Initialize DB (runs CREATE TABLE IF NOT EXISTS on startup)
require('./db/database');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: (origin, cb) => {
    // Allow localhost dev servers and all Vercel deployments (including preview URLs)
    if (
      !origin ||
      origin === 'http://localhost:5173' ||
      origin === 'http://localhost:5174' ||
      origin.endsWith('.vercel.app') ||
      origin === process.env.FRONTEND_URL
    ) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/subjects',      require('./routes/subjects'));
app.use('/api/exams',         require('./routes/exams'));
app.use('/api/settings',      require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/planner',       require('./routes/planner'));
app.use('/api/search',         require('./routes/search'));
app.use('/api/grades',         require('./routes/grades'));
app.use('/api/study-sessions', require('./routes/study-sessions'));

// Health check
app.get('/api/test', (req, res) => res.json({ message: 'API working', status: 'ok' }));

// Admin: view users (protected by ADMIN_SECRET env var)
app.get('/api/admin/users', (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.query.secret !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const db = require('./db/database');
  const users = db.prepare('SELECT id, name, email, created_at FROM users ORDER BY id').all();
  res.json({ count: users.length, users });
});

app.listen(PORT, () => {
  console.log(`WeekFive server running on http://localhost:${PORT}`);
});
