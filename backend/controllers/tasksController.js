const db = require('../db/database');

const fmt = (t) => ({
  id: String(t.id),
  title: t.title,
  description: t.description,
  subject: t.subject,
  priority: t.priority,
  status: t.status,
  dueDate: t.due_date,
  createdAt: t.created_at,
});

const list = (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows.map(fmt));
};

const create = (req, res) => {
  const { title, description = '', subject = '', priority = 'medium', status = 'todo', dueDate = '' } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO tasks (user_id, title, description, subject, priority, status, due_date) VALUES (?,?,?,?,?,?,?)'
  ).run(req.user.id, title.trim(), description, subject, priority, status, dueDate);

  res.status(201).json(fmt(db.prepare('SELECT * FROM tasks WHERE id = ?').get(lastInsertRowid)));
};

const update = (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const map = { title: 'title', description: 'description', subject: 'subject', priority: 'priority', status: 'status', dueDate: 'due_date' };
  const updates = {};
  Object.entries(map).forEach(([bodyKey, col]) => {
    if (req.body[bodyKey] !== undefined) updates[col] = req.body[bodyKey];
  });

  if (Object.keys(updates).length > 0) {
    const set = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE tasks SET ${set} WHERE id = ?`).run(...Object.values(updates), req.params.id);
  }

  res.json(fmt(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)));
};

const remove = (req, res) => {
  const { changes } = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!changes) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
};

module.exports = { list, create, update, remove };
