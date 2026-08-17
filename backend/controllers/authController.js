const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const wrap = require('../middleware/asyncHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'weekfive-dev-secret';

// ── helpers ────────────────────────────────────────────────────────────────
function signToken(id, email) {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
}

function formatUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

async function seedUserData(userId, name) {
  const off = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Subjects
  const subjects = [
    { name: 'Web Development',    color: '#6366f1', teacher: 'Dr. Smith',    credits: 4 },
    { name: 'Database Systems',   color: '#10b981', teacher: 'Prof. Johnson', credits: 3 },
    { name: 'Data Structures',    color: '#f59e0b', teacher: 'Dr. Williams',  credits: 4 },
    { name: 'Software Engineering', color: '#ef4444', teacher: 'Prof. Davis', credits: 3 },
    { name: 'Operating Systems',  color: '#8b5cf6', teacher: 'Dr. Miller',   credits: 3 },
    { name: 'Linear Algebra',     color: '#06b6d4', teacher: 'Prof. Wilson',  credits: 3 },
  ];
  const insSubj = db.prepare('INSERT INTO subjects (user_id, name, color, teacher, credits) VALUES (?,?,?,?,?)');
  for (const s of subjects) await insSubj.run(userId, s.name, s.color, s.teacher, s.credits);

  // Tasks
  const tasks = [
    { title: 'Complete React CRUD app',          desc: 'Build a task manager with full CRUD.', subj: 'Web Development',     prio: 'high',   status: 'in-progress', due: off(4) },
    { title: 'SQL query optimization',            desc: 'Optimize queries using indexes.',      subj: 'Database Systems',    prio: 'medium', status: 'todo',        due: off(6) },
    { title: 'Binary tree implementation',        desc: 'BST with insert, delete, traversal.', subj: 'Data Structures',     prio: 'high',   status: 'todo',        due: off(3) },
    { title: 'UML diagrams for project',          desc: 'Class and sequence diagrams.',         subj: 'Software Engineering',prio: 'medium', status: 'done',        due: off(-2)},
    { title: 'Memory management exercises',       desc: 'Paging and virtual memory.',           subj: 'Operating Systems',   prio: 'low',    status: 'todo',        due: off(9) },
    { title: 'Matrix transformations problem set',desc: 'Eigenvalues and linear transforms.',  subj: 'Linear Algebra',      prio: 'high',   status: 'in-progress', due: off(5) },
  ];
  const insTask = db.prepare('INSERT INTO tasks (user_id, title, description, subject, priority, status, due_date) VALUES (?,?,?,?,?,?,?)');
  for (const t of tasks) await insTask.run(userId, t.title, t.desc, t.subj, t.prio, t.status, t.due);

  // Exams
  const exams = [
    { title: 'Midterm Exam',  subj: 'Web Development',     color: '#6366f1', date: off(9),  topics: ['React','Node.js','REST APIs'],              room: 'Room 301' },
    { title: 'Final Exam',    subj: 'Database Systems',    color: '#10b981', date: off(24), topics: ['SQL','Normalization','Indexes'],             room: 'Lab 102' },
    { title: 'Quiz 3',        subj: 'Data Structures',     color: '#f59e0b', date: off(7),  topics: ['Trees','Graphs','Sorting'],                 room: 'Room 205' },
    { title: 'Project Review',subj: 'Software Engineering', color: '#ef4444', date: off(14), topics: ['SCRUM','Design Patterns','Testing'],        room: 'Auditorium A' },
  ];
  const insExam = db.prepare('INSERT INTO exams (user_id, title, subject, subject_color, date, topics, room) VALUES (?,?,?,?,?,?,?)');
  for (const e of exams) await insExam.run(userId, e.title, e.subj, e.color, e.date, JSON.stringify(e.topics), e.room);

  // Grades (~92 average across the seeded subjects)
  const grades = [
    { subj: 'Web Development',      title: 'Midterm Exam',        score: 94,  max: 100, weight: 25, type: 'exam',     date: off(-14) },
    { subj: 'Web Development',      title: 'Project – Portfolio', score: 98,  max: 100, weight: 20, type: 'project',  date: off(-8)  },
    { subj: 'Database Systems',    title: 'Quiz 2 – SQL Joins',  score: 9.2, max: 10,  weight: 10, type: 'quiz',     date: off(-20) },
    { subj: 'Database Systems',    title: 'Normalization HW',    score: 90,  max: 100, weight: 15, type: 'homework', date: off(-11) },
    { subj: 'Data Structures',     title: 'Midterm Exam',        score: 91,  max: 100, weight: 25, type: 'exam',     date: off(-16) },
    { subj: 'Data Structures',     title: 'Lab – Linked Lists',  score: 100, max: 100, weight: 10, type: 'homework', date: off(-9)  },
    { subj: 'Software Engineering',title: 'Sprint 1 Review',     score: 95,  max: 100, weight: 20, type: 'project',  date: off(-18) },
    { subj: 'Software Engineering',title: 'Requirements Doc',    score: 88,  max: 100, weight: 15, type: 'project',  date: off(-25) },
    { subj: 'Operating Systems',   title: 'Exam 1 – Processes',  score: 89,  max: 100, weight: 25, type: 'exam',     date: off(-13) },
    { subj: 'Operating Systems',   title: 'Scheduling HW',       score: 9.4, max: 10,  weight: 10, type: 'homework', date: off(-7)  },
    { subj: 'Linear Algebra',      title: 'Exam 1 – Matrices',   score: 92,  max: 100, weight: 25, type: 'exam',     date: off(-15) },
    { subj: 'Linear Algebra',      title: 'Eigenvalues Quiz',    score: 9.6, max: 10,  weight: 10, type: 'quiz',     date: off(-6)  },
  ];
  const insGrade = db.prepare(
    'INSERT INTO grades (user_id, subject, title, score, max_score, weight_pct, type, date) VALUES (?,?,?,?,?,?,?,?)'
  );
  for (const g of grades) await insGrade.run(userId, g.subj, g.title, g.score, g.max, g.weight, g.type, g.date);

  // Planner events — anchored to this week's Monday so the calendar always looks alive
  const monday = new Date();
  { const wd = monday.getDay(); monday.setDate(monday.getDate() + (wd === 0 ? -6 : 1 - wd)); }
  const weekday = (weekOffset, dayIdx) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + weekOffset * 7 + dayIdx);
    return d.toISOString().split('T')[0];
  };
  const planner = [
    // This week
    { title: 'Web Development',        w: 0, d: 0, hour: 9,  dur: 2, color: '#6366f1' },
    { title: 'Data Structures Lab',    w: 0, d: 0, hour: 14, dur: 2, color: '#f59e0b' },
    { title: 'Database Systems',       w: 0, d: 1, hour: 8,  dur: 2, color: '#10b981' },
    { title: 'Study – Final Project',  w: 0, d: 1, hour: 16, dur: 2, color: '#6366f1' },
    { title: 'Operating Systems',      w: 0, d: 2, hour: 10, dur: 2, color: '#8b5cf6' },
    { title: 'Software Engineering',   w: 0, d: 3, hour: 11, dur: 2, color: '#ef4444' },
    { title: 'Linear Algebra',         w: 0, d: 3, hour: 15, dur: 2, color: '#06b6d4' },
    { title: 'Study – DS Quiz',        w: 0, d: 4, hour: 10, dur: 3, color: '#f59e0b' },
    // Next week
    { title: 'Web Development',        w: 1, d: 0, hour: 9,  dur: 2, color: '#6366f1' },
    { title: 'Database Systems',       w: 1, d: 1, hour: 8,  dur: 2, color: '#10b981' },
    { title: 'Midterm – Web Dev',      w: 1, d: 2, hour: 9,  dur: 2, color: '#6366f1' },
    { title: 'Operating Systems',      w: 1, d: 3, hour: 10, dur: 2, color: '#8b5cf6' },
    { title: 'Linear Algebra Review',  w: 1, d: 4, hour: 13, dur: 3, color: '#06b6d4' },
  ];
  const insPlan = db.prepare(
    'INSERT INTO planner_events (user_id, title, day, date, hour, duration, color) VALUES (?,?,?,?,?,?,?)'
  );
  for (const p of planner) await insPlan.run(userId, p.title, 0, weekday(p.w, p.d), p.hour, p.dur, p.color);

  // Notifications
  const notifs = [
    { title: `Welcome, ${name}!`,   body: 'Start managing your academic life. Add subjects and tasks to get started.', type: 'info' },
    { title: 'Tasks due soon',       body: 'You have 2 high-priority tasks due in the next 5 days.',                   type: 'warning' },
    { title: 'Exam reminder',        body: 'Data Structures quiz in 7 days. Start reviewing trees and graphs.',        type: 'exam' },
  ];
  const insNotif = db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?,?,?,?)');
  for (const n of notifs) await insNotif.run(userId, n.title, n.body, n.type);
}

// ── controllers ────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password?.trim())
    return res.status(400).json({ message: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  if (await db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase()))
    return res.status(409).json({ message: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const { lastInsertRowid: userId } = await db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?,?,?)'
  ).run(name.trim(), email.toLowerCase().trim(), hash);

  await db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);

  // Populate the new account with realistic demo data so it looks alive on first login.
  await seedUserData(userId, name.trim());

  const user = await db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(userId, user.email), user: formatUser(user) });
};

// Creates a throwaway guest account (unique credentials) pre-populated with demo
// data. Lets recruiters land straight in a live app without hitting a login wall,
// while keeping every visitor's sandbox isolated so the demo can't be vandalized.
const guest = async (req, res) => {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const name = 'Guest';
  const email = `guest_${suffix}@guest.weekfive.app`;
  const hash = bcrypt.hashSync(Math.random().toString(36).slice(2) + 'A9!', 10);

  const { lastInsertRowid: userId } = await db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?,?,?)'
  ).run(name, email, hash);

  await db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
  await seedUserData(userId, name);

  const user = await db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(userId, user.email), user: formatUser(user) });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim())
    return res.status(400).json({ message: 'Email and password are required' });

  const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ message: 'Invalid email or password' });

  res.json({ token: signToken(user.id, user.email), user: formatUser(user) });
};

const getMe = async (req, res) => {
  const user = await db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

const updateProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  if (email?.trim() && email.toLowerCase() !== user.email) {
    if (await db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.toLowerCase(), req.user.id))
      return res.status(409).json({ message: 'Email already in use' });
    updates.email = email.toLowerCase().trim();
  }
  if (newPassword) {
    if (!currentPassword) return res.status(400).json({ message: 'Current password is required' });
    if (!bcrypt.compareSync(currentPassword, user.password_hash))
      return res.status(401).json({ message: 'Current password is incorrect' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
    updates.password_hash = bcrypt.hashSync(newPassword, 10);
  }

  if (Object.keys(updates).length > 0) {
    const set = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await db.prepare(`UPDATE users SET ${set} WHERE id = ?`).run(...Object.values(updates), req.user.id);
  }

  const updated = await db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.id);
  res.json(formatUser(updated));
};

const deleteAccount = async (req, res) => {
  await db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
  res.json({ message: 'Account deleted' });
};

module.exports = wrap({ register, guest, login, getMe, updateProfile, deleteAccount });
