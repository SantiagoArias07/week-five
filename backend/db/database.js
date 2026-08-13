const { createClient } = require('@libsql/client');
const path = require('path');

// Production: Turso (libSQL) via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
// Development: falls back to a local SQLite file (backend/weekfive.db) — no
// credentials needed, so `npm run dev` works out of the box.
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '..', 'weekfive.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`[DB] Using ${url.startsWith('file:') ? 'local file' : 'Turso'} database`);

const client = createClient(authToken ? { url, authToken } : { url });

// libSQL rejects `undefined` bind values — coerce them to null.
const norm = (args) => args.map((v) => (v === undefined ? null : v));

// Compatibility shim mimicking node:sqlite's `prepare(sql).get/all/run(...)`
// API, but async (network DB). Controllers just add `await` to each call.
function prepare(sql) {
  return {
    async get(...args) {
      const { rows } = await client.execute({ sql, args: norm(args) });
      return rows[0];
    },
    async all(...args) {
      const { rows } = await client.execute({ sql, args: norm(args) });
      return rows;
    },
    async run(...args) {
      const r = await client.execute({ sql, args: norm(args) });
      return {
        lastInsertRowid: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : undefined,
        changes: Number(r.rowsAffected),
      };
    },
  };
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id             INTEGER PRIMARY KEY,
    dark_mode           INTEGER DEFAULT 0,
    language            TEXT    DEFAULT 'en',
    push_notifications  INTEGER DEFAULT 1,
    email_reminders     INTEGER DEFAULT 0,
    sound_effects       INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    name       TEXT    NOT NULL,
    color      TEXT    DEFAULT '#6366f1',
    teacher    TEXT    DEFAULT '',
    credits    INTEGER DEFAULT 3,
    created_at TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    title       TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    subject     TEXT    DEFAULT '',
    priority    TEXT    DEFAULT 'medium',
    status      TEXT    DEFAULT 'todo',
    due_date    TEXT    DEFAULT '',
    created_at  TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exams (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL,
    title         TEXT    NOT NULL,
    subject       TEXT    NOT NULL,
    subject_color TEXT    DEFAULT '#6366f1',
    date          TEXT    NOT NULL,
    topics        TEXT    DEFAULT '[]',
    room          TEXT    DEFAULT '',
    created_at    TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS planner_events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    title      TEXT    NOT NULL,
    day        INTEGER NOT NULL,
    hour       INTEGER NOT NULL,
    duration   INTEGER DEFAULT 1,
    color      TEXT    DEFAULT '#6366f1',
    created_at TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    title      TEXT    NOT NULL,
    body       TEXT    DEFAULT '',
    type       TEXT    DEFAULT 'info',
    read       INTEGER DEFAULT 0,
    created_at TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subject_notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    content    TEXT    NOT NULL,
    category   TEXT    DEFAULT 'general',
    pinned     INTEGER DEFAULT 0,
    created_at TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS grades (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    subject    TEXT    NOT NULL,
    title      TEXT    NOT NULL,
    score      REAL    NOT NULL,
    max_score  REAL    NOT NULL DEFAULT 100,
    weight_pct REAL    DEFAULT 0,
    type       TEXT    DEFAULT 'exam',
    date       TEXT    DEFAULT '',
    notes      TEXT    DEFAULT '',
    created_at TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    subject    TEXT    DEFAULT '',
    duration   INTEGER NOT NULL DEFAULT 25,
    date       TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Indexes on the columns every list query filters by (user_id), so the DB
  -- scales instead of full-scanning tables as rows grow.
  CREATE INDEX IF NOT EXISTS idx_tasks_user          ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_subjects_user       ON subjects(user_id);
  CREATE INDEX IF NOT EXISTS idx_exams_user          ON exams(user_id);
  CREATE INDEX IF NOT EXISTS idx_planner_user        ON planner_events(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user  ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_subject_user  ON subject_notes(subject_id, user_id);
  CREATE INDEX IF NOT EXISTS idx_grades_user         ON grades(user_id);
  CREATE INDEX IF NOT EXISTS idx_study_user_date     ON study_sessions(user_id, date);
`;

// Runs schema + safe migrations on startup. Awaited in index.js before listen.
async function initDb() {
  await client.execute('PRAGMA foreign_keys = ON').catch(() => {});
  await client.executeMultiple(SCHEMA);

  // Safe migrations — add columns that may not exist yet (ignore if present)
  const migrations = [
    "ALTER TABLE notifications ADD COLUMN source_type TEXT DEFAULT ''",
    "ALTER TABLE notifications ADD COLUMN source_id   TEXT DEFAULT ''",
    "ALTER TABLE planner_events ADD COLUMN date TEXT DEFAULT ''",
    "ALTER TABLE exams ADD COLUMN weight_pct REAL DEFAULT 0",
  ];
  for (const sql of migrations) {
    try { await client.execute(sql); } catch {}
  }
}

module.exports = { prepare, initDb, client };
