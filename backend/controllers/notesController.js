const db = require('../db/database');

const fmt = (n) => ({
  id: String(n.id),
  subjectId: String(n.subject_id),
  content: n.content,
  category: n.category,
  pinned: Boolean(n.pinned),
  createdAt: n.created_at,
});

const list = (req, res) => {
  const { subjectId } = req.params;
  // Verify the subject belongs to this user
  const subject = db.prepare('SELECT id FROM subjects WHERE id = ? AND user_id = ?').get(subjectId, req.user.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found' });

  const rows = db.prepare(`
    SELECT * FROM subject_notes
    WHERE subject_id = ? AND user_id = ?
    ORDER BY pinned DESC, created_at DESC
  `).all(subjectId, req.user.id);
  res.json(rows.map(fmt));
};

const create = (req, res) => {
  const { subjectId } = req.params;
  const { content, category = 'general' } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

  const subject = db.prepare('SELECT id FROM subjects WHERE id = ? AND user_id = ?').get(subjectId, req.user.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found' });

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO subject_notes (user_id, subject_id, content, category) VALUES (?,?,?,?)'
  ).run(req.user.id, subjectId, content.trim(), category);

  const row = db.prepare('SELECT * FROM subject_notes WHERE id = ?').get(lastInsertRowid);
  res.status(201).json(fmt(row));
};

const update = (req, res) => {
  const { subjectId, noteId } = req.params;
  const { content, category, pinned } = req.body;

  const note = db.prepare('SELECT * FROM subject_notes WHERE id = ? AND subject_id = ? AND user_id = ?').get(noteId, subjectId, req.user.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });

  const newContent  = content  !== undefined ? content.trim()        : note.content;
  const newCategory = category !== undefined ? category              : note.category;
  const newPinned   = pinned   !== undefined ? (pinned ? 1 : 0)      : note.pinned;

  db.prepare('UPDATE subject_notes SET content=?, category=?, pinned=? WHERE id=?')
    .run(newContent, newCategory, newPinned, noteId);

  const row = db.prepare('SELECT * FROM subject_notes WHERE id = ?').get(noteId);
  res.json(fmt(row));
};

const remove = (req, res) => {
  const { subjectId, noteId } = req.params;
  const { changes } = db.prepare('DELETE FROM subject_notes WHERE id = ? AND subject_id = ? AND user_id = ?').run(noteId, subjectId, req.user.id);
  if (!changes) return res.status(404).json({ message: 'Note not found' });
  res.json({ message: 'Note deleted' });
};

module.exports = { list, create, update, remove };
