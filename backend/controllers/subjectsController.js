const db = require('../db/database');

const fmt = (s) => ({
  id: String(s.id),
  name: s.name,
  color: s.color,
  teacher: s.teacher,
  credits: s.credits,
  taskCount: s.taskCount || 0,
});

const list = (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, COUNT(t.id) as taskCount
    FROM subjects s
    LEFT JOIN tasks t ON t.subject = s.name AND t.user_id = s.user_id
    WHERE s.user_id = ?
    GROUP BY s.id
    ORDER BY s.name
  `).all(req.user.id);
  res.json(rows.map(fmt));
};

const create = (req, res) => {
  const { name, color = '#6366f1', teacher = '', credits = 3 } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO subjects (user_id, name, color, teacher, credits) VALUES (?,?,?,?,?)'
  ).run(req.user.id, name.trim(), color, teacher, credits);

  const row = db.prepare('SELECT *, 0 as taskCount FROM subjects WHERE id = ?').get(lastInsertRowid);
  res.status(201).json(fmt(row));
};

const remove = (req, res) => {
  const { changes } = db.prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!changes) return res.status(404).json({ message: 'Subject not found' });
  res.json({ message: 'Subject deleted' });
};

module.exports = { list, create, remove };
