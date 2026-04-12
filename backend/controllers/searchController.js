const db = require('../db/database');

const search = (req, res) => {
  const { q } = req.query;
  if (!q?.trim() || q.trim().length < 2) {
    return res.json({ tasks: [], subjects: [], exams: [] });
  }

  const like = `%${q.trim()}%`;
  const uid = req.user.id;

  const tasks = db.prepare(
    'SELECT id, title, status, priority, subject FROM tasks WHERE user_id = ? AND title LIKE ? LIMIT 5'
  ).all(uid, like).map(t => ({ ...t, id: String(t.id) }));

  const subjects = db.prepare(
    'SELECT id, name, color FROM subjects WHERE user_id = ? AND name LIKE ? LIMIT 5'
  ).all(uid, like).map(s => ({ ...s, id: String(s.id) }));

  const exams = db.prepare(
    'SELECT id, title, subject, date FROM exams WHERE user_id = ? AND (title LIKE ? OR subject LIKE ?) LIMIT 5'
  ).all(uid, like, like).map(e => ({ ...e, id: String(e.id) }));

  res.json({ tasks, subjects, exams });
};

module.exports = { search };
