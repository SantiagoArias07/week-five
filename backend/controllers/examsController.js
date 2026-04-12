const db = require('../db/database');

const fmt = (e) => ({
  id: String(e.id),
  title: e.title,
  subject: e.subject,
  subjectColor: e.subject_color,
  date: e.date,
  topics: JSON.parse(e.topics || '[]'),
  room: e.room,
});

const list = (req, res) => {
  const rows = db.prepare('SELECT * FROM exams WHERE user_id = ? ORDER BY date ASC').all(req.user.id);
  res.json(rows.map(fmt));
};

const create = (req, res) => {
  const { title, subject, subjectColor = '#6366f1', date, topics = [], room = '' } = req.body;
  if (!title?.trim() || !subject?.trim() || !date)
    return res.status(400).json({ message: 'Title, subject, and date are required' });

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO exams (user_id, title, subject, subject_color, date, topics, room) VALUES (?,?,?,?,?,?,?)'
  ).run(req.user.id, title.trim(), subject.trim(), subjectColor, date, JSON.stringify(topics), room);

  res.status(201).json(fmt(db.prepare('SELECT * FROM exams WHERE id = ?').get(lastInsertRowid)));
};

const remove = (req, res) => {
  const { changes } = db.prepare('DELETE FROM exams WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!changes) return res.status(404).json({ message: 'Exam not found' });
  res.json({ message: 'Exam deleted' });
};

module.exports = { list, create, remove };
