const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { initDb, prepare } = require('./db/database');

// Fail fast if deployed without a real JWT secret — otherwise tokens could be
// forged using the well-known dev fallback.
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'weekfive-dev-secret') {
    console.error('FATAL: JWT_SECRET must be set to a strong value in production.');
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5001;

// Trust the single reverse proxy in front of the app (Render) so rate limiting
// and req.ip see the real client address, not the proxy's.
app.set('trust proxy', 1);

// Security headers. This is a JSON API (no HTML), so the default CSP is not needed.
app.use(helmet({ contentSecurityPolicy: false }));

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

// Throttle auth endpoints to slow down brute-force / credential-stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                  // per IP, per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Guest sessions each seed a full demo dataset, so cap creation per IP to keep
// bots from bloating the DB. Generous enough for real visitors (one per browser).
const guestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                  // per IP, per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many guest sessions from this network. Please try again in a few minutes.' },
});
app.use('/api/auth/guest', guestLimiter);

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
app.get('/api/admin/users', async (req, res, next) => {
  try {
    const secret = process.env.ADMIN_SECRET;
    if (!secret || req.query.secret !== secret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const users = await prepare('SELECT id, name, email, created_at FROM users ORDER BY id').all();
    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
});

// Centralized error handler — catches rejections forwarded by asyncHandler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

// Initialize DB (creates tables + runs migrations), then start the server.
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`WeekFive server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Failed to initialize database:', err);
    process.exit(1);
  });
