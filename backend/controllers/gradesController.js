const db = require('../db/database');

const fmt = (g) => ({
  id: String(g.id),
  subject: g.subject,
  title: g.title,
  score: g.score,
  maxScore: g.max_score,
  weightPct: g.weight_pct ?? 0,
  type: g.type,
  date: g.date || '',
  notes: g.notes || '',
  createdAt: g.created_at,
});

const list = (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM grades WHERE user_id = ? ORDER BY date DESC, id DESC'
  ).all(req.user.id);
  res.json(rows.map(fmt));
};

const create = (req, res) => {
  const {
    subject, title, score,
    maxScore = 100, weightPct = 0,
    type = 'exam', date = '', notes = '',
  } = req.body;
  if (!subject?.trim() || !title?.trim() || score === undefined || score === null)
    return res.status(400).json({ message: 'subject, title, and score are required' });

  const { lastInsertRowid } = db.prepare(
    `INSERT INTO grades (user_id, subject, title, score, max_score, weight_pct, type, date, notes)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(
    req.user.id,
    subject.trim(),
    title.trim(),
    Number(score),
    Number(maxScore),
    Number(weightPct),
    type,
    date,
    (notes || '').trim(),
  );
  res.status(201).json(fmt(db.prepare('SELECT * FROM grades WHERE id = ?').get(lastInsertRowid)));
};

const remove = (req, res) => {
  const { changes } = db.prepare(
    'DELETE FROM grades WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.id);
  if (!changes) return res.status(404).json({ message: 'Grade not found' });
  res.json({ message: 'Grade deleted' });
};

module.exports = { list, create, remove };
