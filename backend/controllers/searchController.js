const db = require('../db/database');
const wrap = require('../middleware/asyncHandler');

const search = async (req, res) => {
  const { q } = req.query;
  if (!q?.trim() || q.trim().length < 2) {
    return res.json({ tasks: [], subjects: [], exams: [] });
  }

  const like = `%${q.trim()}%`;
  const uid = req.user.id;

  const tasks = (await db.prepare(
    'SELECT id, title, status, priority, subject FROM tasks WHERE user_id = ? AND title LIKE ? LIMIT 5'
  ).all(uid, like)).map(t => ({ ...t, id: String(t.id) }));

  const subjects = (await db.prepare(
    'SELECT id, name, color FROM subjects WHERE user_id = ? AND name LIKE ? LIMIT 5'
  ).all(uid, like)).map(s => ({ ...s, id: String(s.id) }));

  const exams = (await db.prepare(
    'SELECT id, title, subject, date FROM exams WHERE user_id = ? AND (title LIKE ? OR subject LIKE ?) LIMIT 5'
  ).all(uid, like, like)).map(e => ({ ...e, id: String(e.id) }));

  res.json({ tasks, subjects, exams });
};

module.exports = wrap({ search });
