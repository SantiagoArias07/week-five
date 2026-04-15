const db = require('../db/database');

const fmt = (e) => ({
  id: String(e.id),
  title: e.title,
  date: e.date || '',
  hour: e.hour,
  duration: e.duration,
  color: e.color,
});

const list = (req, res) => {
  const rows = db.prepare('SELECT * FROM planner_events WHERE user_id = ? ORDER BY date, hour').all(req.user.id);
  res.json(rows.map(fmt));
};

const create = (req, res) => {
  const { title, date, hour, duration = 1, color = '#6366f1' } = req.body;
  if (!title || !date || hour === undefined || hour === null) {
    return res.status(400).json({ message: 'title, date, and hour are required' });
  }
  const info = db.prepare(
    'INSERT INTO planner_events (user_id, title, day, date, hour, duration, color) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, title, 0, date, hour, duration, color);
  const row = db.prepare('SELECT * FROM planner_events WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(fmt(row));
};

const update = (req, res) => {
  const existing = db.prepare('SELECT * FROM planner_events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ message: 'Event not found' });
  const { title, date, hour, duration, color } = req.body;
  db.prepare(
    'UPDATE planner_events SET title = ?, date = ?, hour = ?, duration = ?, color = ? WHERE id = ? AND user_id = ?'
  ).run(
    title     ?? existing.title,
    date      ?? existing.date ?? '',
    hour      ?? existing.hour,
    duration  ?? existing.duration,
    color     ?? existing.color,
    req.params.id,
    req.user.id
  );
  res.json(fmt(db.prepare('SELECT * FROM planner_events WHERE id = ?').get(req.params.id)));
};

const remove = (req, res) => {
  const { changes } = db.prepare('DELETE FROM planner_events WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!changes) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
};

module.exports = { list, create, update, remove };
