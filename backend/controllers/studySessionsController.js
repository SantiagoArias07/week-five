const db = require('../db/database');
const wrap = require('../middleware/asyncHandler');

const listWeekly = async (req, res) => {
  const rows = await db.prepare(`
    SELECT
      date,
      SUM(duration) AS totalMinutes,
      COUNT(*)      AS sessions
    FROM study_sessions
    WHERE user_id = ?
      AND date >= date('now', '-6 days')
    GROUP BY date
    ORDER BY date ASC
  `).all(req.user.id);
  res.json(rows);
};

const create = async (req, res) => {
  const { subject = '', duration = 25, date } = req.body;
  if (!date) return res.status(400).json({ message: 'date is required' });
  const { lastInsertRowid } = await db.prepare(
    'INSERT INTO study_sessions (user_id, subject, duration, date) VALUES (?,?,?,?)'
  ).run(req.user.id, subject, Number(duration), date);
  res.status(201).json({ id: String(lastInsertRowid), subject, duration: Number(duration), date });
};

module.exports = wrap({ listWeekly, create });
