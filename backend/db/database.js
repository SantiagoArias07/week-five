const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// In production (Railway) use /app/data so the DB lives on the mounted Volume.
// In development fall back to the local backend/ folder.
const DB_DIR = process.env.DB_DIR || path.join(__dirname, '..');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DB_DIR, 'weekfive.db'));

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
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
`);

// Safe migrations — add columns that may not exist yet
try { db.exec("ALTER TABLE notifications ADD COLUMN source_type TEXT DEFAULT ''"); } catch {}
try { db.exec("ALTER TABLE notifications ADD COLUMN source_id   TEXT DEFAULT ''"); } catch {}
try { db.exec("ALTER TABLE planner_events ADD COLUMN date TEXT DEFAULT ''"); } catch {}
try { db.exec("ALTER TABLE exams ADD COLUMN weight_pct REAL DEFAULT 0"); } catch {}

module.exports = db;
