const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'weekfive-dev-secret';

// ── helpers ────────────────────────────────────────────────────────────────
function signToken(id, email) {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
}

function formatUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

function seedUserData(userId, name) {
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
  subjects.forEach(s => insSubj.run(userId, s.name, s.color, s.teacher, s.credits));

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
  tasks.forEach(t => insTask.run(userId, t.title, t.desc, t.subj, t.prio, t.status, t.due));

  // Exams
  const exams = [
    { title: 'Midterm Exam',  subj: 'Web Development',     color: '#6366f1', date: off(9),  topics: ['React','Node.js','REST APIs'],              room: 'Room 301' },
    { title: 'Final Exam',    subj: 'Database Systems',    color: '#10b981', date: off(24), topics: ['SQL','Normalization','Indexes'],             room: 'Lab 102' },
    { title: 'Quiz 3',        subj: 'Data Structures',     color: '#f59e0b', date: off(7),  topics: ['Trees','Graphs','Sorting'],                 room: 'Room 205' },
    { title: 'Project Review',subj: 'Software Engineering', color: '#ef4444', date: off(14), topics: ['SCRUM','Design Patterns','Testing'],        room: 'Auditorium A' },
  ];
  const insExam = db.prepare('INSERT INTO exams (user_id, title, subject, subject_color, date, topics, room) VALUES (?,?,?,?,?,?,?)');
  exams.forEach(e => insExam.run(userId, e.title, e.subj, e.color, e.date, JSON.stringify(e.topics), e.room));

  // Notifications
  const notifs = [
    { title: `Welcome, ${name}!`,   body: 'Start managing your academic life. Add subjects and tasks to get started.', type: 'info' },
    { title: 'Tasks due soon',       body: 'You have 2 high-priority tasks due in the next 5 days.',                   type: 'warning' },
    { title: 'Exam reminder',        body: 'Data Structures quiz in 7 days. Start reviewing trees and graphs.',        type: 'exam' },
  ];
  const insNotif = db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?,?,?,?)');
  notifs.forEach(n => insNotif.run(userId, n.title, n.body, n.type));
}

// ── controllers ────────────────────────────────────────────────────────────
const register = (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password?.trim())
    return res.status(400).json({ message: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase()))
    return res.status(409).json({ message: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const { lastInsertRowid: userId } = db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?,?,?)'
  ).run(name.trim(), email.toLowerCase().trim(), hash);

  db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);

  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(userId, user.email), user: formatUser(user) });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim())
    return res.status(400).json({ message: 'Email and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ message: 'Invalid email or password' });

  res.json({ token: signToken(user.id, user.email), user: formatUser(user) });
};

const getMe = (req, res) => {
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

const updateProfile = (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  if (email?.trim() && email.toLowerCase() !== user.email) {
    if (db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.toLowerCase(), req.user.id))
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
    db.prepare(`UPDATE users SET ${set} WHERE id = ?`).run(...Object.values(updates), req.user.id);
  }

  const updated = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.id);
  res.json(formatUser(updated));
};

const deleteAccount = (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
  res.json({ message: 'Account deleted' });
};

module.exports = { register, login, getMe, updateProfile, deleteAccount };
