const db = require('../db/database');

const fmt = (n) => ({
  id: String(n.id),
  title: n.title,
  body: n.body,
  type: n.type,
  read: Boolean(n.read),
  createdAt: n.created_at,
});

const list = (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(req.user.id);
  res.json(rows.map(fmt));
};

const markRead = (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Marked as read' });
};

const markAllRead = (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'All notifications marked as read' });
};

module.exports = { list, markRead, markAllRead };
