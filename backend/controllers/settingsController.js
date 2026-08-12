const db = require('../db/database');
const wrap = require('../middleware/asyncHandler');

const ensureRow = async (userId) => {
  if (!await db.prepare('SELECT user_id FROM user_settings WHERE user_id = ?').get(userId)) {
    await db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
  }
};

const fmt = (s) => ({
  darkMode: Boolean(s.dark_mode),
  language: s.language,
  pushNotifications: Boolean(s.push_notifications),
  emailReminders: Boolean(s.email_reminders),
  soundEffects: Boolean(s.sound_effects),
});

const getSettings = async (req, res) => {
  await ensureRow(req.user.id);
  const row = await db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
  res.json(fmt(row));
};

const updateSettings = async (req, res) => {
  await ensureRow(req.user.id);
  const map = {
    darkMode: 'dark_mode',
    language: 'language',
    pushNotifications: 'push_notifications',
    emailReminders: 'email_reminders',
    soundEffects: 'sound_effects',
  };

  const updates = {};
  Object.entries(map).forEach(([bodyKey, col]) => {
    if (req.body[bodyKey] !== undefined) {
      updates[col] = typeof req.body[bodyKey] === 'boolean' ? (req.body[bodyKey] ? 1 : 0) : req.body[bodyKey];
    }
  });

  if (Object.keys(updates).length > 0) {
    const set = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await db.prepare(`UPDATE user_settings SET ${set} WHERE user_id = ?`).run(...Object.values(updates), req.user.id);
  }

  const updated = await db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
  res.json(fmt(updated));
};

module.exports = wrap({ getSettings, updateSettings });
