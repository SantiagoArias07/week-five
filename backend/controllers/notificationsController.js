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
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30'
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

/**
 * Refresh auto-generated notifications based on current tasks and exams.
 * Deletes old auto-generated ones, then creates fresh ones.
 */
const refresh = (req, res) => {
  // Remove stale auto-generated notifications
  db.prepare(
    "DELETE FROM notifications WHERE user_id = ? AND source_type IN ('task', 'exam')"
  ).run(req.user.id);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const tasks = db.prepare(
    "SELECT * FROM tasks WHERE user_id = ? AND status != 'done' AND due_date != '' AND due_date IS NOT NULL"
  ).all(req.user.id);

  const insNotif = db.prepare(
    "INSERT INTO notifications (user_id, title, body, type, source_type, source_id) VALUES (?, ?, ?, ?, ?, ?)"
  );

  for (const task of tasks) {
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    const diff = Math.round((due - now) / (1000 * 60 * 60 * 24));

    let title = null, body = null, type = 'warning';
    if (diff < 0) {
      title = `Overdue: ${task.title}`;
      body = `This task was due ${Math.abs(diff)} day(s) ago. Mark it as done or update its due date.`;
      type = 'warning';
    } else if (diff === 0) {
      title = `Due today: ${task.title}`;
      body = `"${task.title}" is due today. Prioritize it!`;
      type = 'warning';
    } else if (diff === 1) {
      title = `Due tomorrow: ${task.title}`;
      body = `"${task.title}" is due tomorrow. Make sure you're on track.`;
      type = 'task';
    } else if (diff <= 3) {
      title = `Due in ${diff} days: ${task.title}`;
      body = `"${task.title}" (${task.subject || 'No subject'}) is due in ${diff} days.`;
      type = 'task';
    }

    if (title) {
      insNotif.run(req.user.id, title, body, type, 'task', String(task.id));
    }
  }

  // ── Exams ──────────────────────────────────────────────────────────────────
  const exams = db.prepare('SELECT * FROM exams WHERE user_id = ?').all(req.user.id);

  for (const exam of exams) {
    const examDate = new Date(exam.date);
    examDate.setHours(0, 0, 0, 0);
    const diff = Math.round((examDate - now) / (1000 * 60 * 60 * 24));

    let title = null, body = null;
    if (diff === 0) {
      title = `Exam today: ${exam.title}`;
      body = `Your ${exam.subject} exam is today. Good luck!`;
    } else if (diff === 1) {
      title = `Exam tomorrow: ${exam.title}`;
      body = `Your ${exam.subject} exam is tomorrow. Final review time!`;
    } else if (diff === 3) {
      title = `Exam in 3 days: ${exam.title}`;
      body = `Your ${exam.subject} exam is in 3 days (${exam.date}). Keep studying!`;
    } else if (diff === 7) {
      title = `Exam next week: ${exam.title}`;
      body = `Your ${exam.subject} exam is in one week (${exam.date}). Start preparing!`;
    } else if (diff === 14) {
      title = `Exam in 2 weeks: ${exam.title}`;
      body = `Your ${exam.subject} exam is in two weeks. Plan your study sessions.`;
    }

    if (title) {
      insNotif.run(req.user.id, title, body, 'exam', 'exam', String(exam.id));
    }
  }

  const rows = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30'
  ).all(req.user.id);
  res.json(rows.map(fmt));
};

module.exports = { list, markRead, markAllRead, refresh };
