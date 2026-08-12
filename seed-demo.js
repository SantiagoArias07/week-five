// WeekFive — Demo Account Seeder
// Run: node seed-demo.js
// Override the target API with SEED_API_URL, e.g.
//   SEED_API_URL=https://weekfive-backend.onrender.com/api node seed-demo.js

const BASE = process.env.SEED_API_URL || 'https://weekfive-backend.onrender.com/api';

const req = async (method, path, body, token) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) console.warn(`  ⚠ ${method} ${path}:`, data.message ?? data);
  return data;
};

const post = (path, body, token) => req('POST', path, body, token);
const put  = (path, body, token) => req('PUT',  path, body, token);

async function main() {
  console.log('🌱 Seeding WeekFive demo account...\n');

  // ── 1. Register & login ────────────────────────────────────────────────────
  await post('/auth/register', {
    name: 'Santiago Arias',
    email: 'demo@weekfive.app',
    password: 'WeekFive2026!',
  });

  const { token } = await post('/auth/login', {
    email: 'demo@weekfive.app',
    password: 'WeekFive2026!',
  });

  if (!token) { console.error('❌ Login failed — account may already exist'); return; }
  console.log('✓ Account created & logged in');

  await put('/settings', { darkMode: false, language: 'en' }, token);

  // ── 2. Subjects ────────────────────────────────────────────────────────────
  const subjectList = [
    { name: 'Advanced Programming',   color: '#6366f1', teacher: 'Dr. Martínez', credits: 5 },
    { name: 'Multivariable Calculus', color: '#10b981', teacher: 'Dr. Johnson',  credits: 4 },
    { name: 'Data Structures',        color: '#f59e0b', teacher: 'Dr. Chen',     credits: 5 },
    { name: 'Discrete Mathematics',   color: '#ef4444', teacher: 'Dr. Williams', credits: 3 },
    { name: 'Software Engineering',   color: '#8b5cf6', teacher: 'Dr. García',   credits: 4 },
    { name: 'Physics II',             color: '#06b6d4', teacher: 'Dr. Lee',      credits: 4 },
  ];
  for (const s of subjectList) await post('/subjects', s, token);
  console.log('✓ Subjects created');

  // ── 3. Tasks ───────────────────────────────────────────────────────────────
  const tasks = [
    // Done (past)
    { title: 'Lab 3 – Linked Lists',           subject: 'Data Structures',        priority: 'medium', status: 'done',        dueDate: '2026-04-25', description: 'Singly and doubly linked list with all basic operations.' },
    { title: 'Problem Set 4',                   subject: 'Multivariable Calculus', priority: 'medium', status: 'done',        dueDate: '2026-04-24', description: 'Partial derivatives and gradient problems — Chapter 14.' },
    { title: 'UML Class Diagram',               subject: 'Software Engineering',   priority: 'high',   status: 'done',        dueDate: '2026-04-23', description: 'Full UML diagram for the semester project architecture.' },
    { title: 'Physics Lab Report #2',           subject: 'Physics II',             priority: 'medium', status: 'done',        dueDate: '2026-04-22', description: 'Write-up for the electromagnetic induction experiment.' },
    { title: 'Midterm Study Guide',             subject: 'Advanced Programming',   priority: 'high',   status: 'done',        dueDate: '2026-04-21', description: 'Comprehensive notes on OOP, design patterns, and recursion.' },
    { title: 'Homework 5 – Logic Proofs',       subject: 'Discrete Mathematics',   priority: 'low',    status: 'done',        dueDate: '2026-04-20', description: 'Propositional and predicate logic proof exercises.' },
    { title: 'Binary Tree Implementation',      subject: 'Data Structures',        priority: 'high',   status: 'done',        dueDate: '2026-04-18', description: 'BST with insert, delete, search and all traversals.' },
    { title: 'Parametric Equations Practice',   subject: 'Multivariable Calculus', priority: 'low',    status: 'done',        dueDate: '2026-04-15', description: '20 practice problems on parametric curves and surfaces.' },
    // In progress
    { title: 'Final Project – Phase 2',         subject: 'Advanced Programming',   priority: 'high',   status: 'in-progress', dueDate: '2026-05-10', description: 'Backend API and database integration for semester project.' },
    { title: 'Problem Set 7',                   subject: 'Multivariable Calculus', priority: 'medium', status: 'in-progress', dueDate: '2026-05-06', description: 'Line integrals and Green\'s theorem problems.' },
    { title: 'Algorithm Complexity Report',     subject: 'Data Structures',        priority: 'high',   status: 'in-progress', dueDate: '2026-05-08', description: 'Big-O analysis of all sorting and searching algorithms covered.' },
    // Todo
    { title: 'Sprint Review Presentation',      subject: 'Software Engineering',   priority: 'high',   status: 'todo',        dueDate: '2026-05-07', description: 'Present Sprint 3 demo and architecture decisions to professor.' },
    { title: 'Logic and Sets Homework',         subject: 'Discrete Mathematics',   priority: 'low',    status: 'todo',        dueDate: '2026-05-09', description: 'Set theory, Boolean algebra, and combinatorics exercises.' },
    { title: 'Code Review – Team PRs',          subject: 'Advanced Programming',   priority: 'medium', status: 'todo',        dueDate: '2026-05-05', description: 'Review and approve all three teammates\' pull requests.' },
    { title: 'Physics Lab #4',                  subject: 'Physics II',             priority: 'medium', status: 'todo',        dueDate: '2026-05-12', description: 'Capacitors and RC circuits — pre-lab questions and setup.' },
    { title: 'Triple Integrals Practice',       subject: 'Multivariable Calculus', priority: 'low',    status: 'todo',        dueDate: '2026-05-13', description: 'Problems 1–25 from Chapter 15.' },
    { title: 'Sorting Algorithms – Extra Credit', subject: 'Data Structures',      priority: 'medium', status: 'todo',        dueDate: '2026-05-15', description: 'Implement radix sort and counting sort with benchmarks.' },
    { title: 'Final Exam Study Guide',          subject: 'Physics II',             priority: 'high',   status: 'todo',        dueDate: '2026-05-20', description: 'Review all units: E&M, waves, optics, and modern physics.' },
  ];
  for (const t of tasks) await post('/tasks', t, token);
  console.log('✓ Tasks created');

  // ── 4. Exams ───────────────────────────────────────────────────────────────
  const exams = [
    { title: 'Exam 3 – Vector Calculus',  subject: 'Multivariable Calculus', subjectColor: '#10b981', date: '2026-05-14', topics: ['Line integrals', "Green's theorem", 'Surface integrals', 'Divergence theorem'], room: 'B-105', weightPct: 25 },
    { title: 'Sprint 3 Presentation',     subject: 'Software Engineering',   subjectColor: '#8b5cf6', date: '2026-05-16', topics: ['Sprint demo', 'Architecture review', 'Code quality', 'Q&A'], room: 'Lab 2', weightPct: 30 },
    { title: 'Final Exam',                subject: 'Discrete Mathematics',   subjectColor: '#ef4444', date: '2026-05-21', topics: ['Graph theory', 'Combinatorics', 'Number theory', 'Proof techniques'], room: 'B-201', weightPct: 40 },
    { title: 'Final Exam',                subject: 'Data Structures',        subjectColor: '#f59e0b', date: '2026-05-20', topics: ['Trees & graphs', 'Dynamic programming', 'Sorting algorithms', 'Complexity analysis'], room: 'C-301', weightPct: 40 },
    { title: 'Final Exam',                subject: 'Advanced Programming',   subjectColor: '#6366f1', date: '2026-05-22', topics: ['Design patterns', 'Concurrency', 'REST APIs', 'Unit testing'], room: 'A-201', weightPct: 35 },
    { title: 'Final Exam',                subject: 'Physics II',             subjectColor: '#06b6d4', date: '2026-05-23', topics: ['Electromagnetism', 'Circuits', 'Waves & optics', 'Modern physics'], room: 'D-102', weightPct: 35 },
  ];
  for (const e of exams) await post('/exams', e, token);
  console.log('✓ Exams created');

  // ── 5. Grades (~96 avg) ────────────────────────────────────────────────────
  const grades = [
    // Advanced Programming — avg ~97
    { subject: 'Advanced Programming', title: 'Midterm Exam',           score: 95,  maxScore: 100, weightPct: 25, type: 'exam',     date: '2026-04-10' },
    { subject: 'Advanced Programming', title: 'Project 1 – OOP Design', score: 98,  maxScore: 100, weightPct: 15, type: 'project',  date: '2026-03-28' },
    { subject: 'Advanced Programming', title: 'Quiz 3 – Recursion',     score: 9.7, maxScore: 10,  weightPct: 10, type: 'quiz',     date: '2026-03-14' },
    { subject: 'Advanced Programming', title: 'Homework Average (1–6)', score: 97,  maxScore: 100, weightPct: 15, type: 'homework', date: '2026-04-20' },
    // Multivariable Calculus — avg ~96
    { subject: 'Multivariable Calculus', title: 'Exam 1 – Partial Derivatives', score: 94,  maxScore: 100, weightPct: 20, type: 'exam',     date: '2026-03-05' },
    { subject: 'Multivariable Calculus', title: 'Exam 2 – Multiple Integrals',  score: 97,  maxScore: 100, weightPct: 20, type: 'exam',     date: '2026-04-08' },
    { subject: 'Multivariable Calculus', title: 'Homework Average (1–6)',        score: 9.8, maxScore: 10,  weightPct: 20, type: 'homework', date: '2026-04-22' },
    { subject: 'Multivariable Calculus', title: 'Quiz 1 – Limits',              score: 9.5, maxScore: 10,  weightPct: 5,  type: 'quiz',     date: '2026-02-20' },
    // Data Structures — avg ~97
    { subject: 'Data Structures', title: 'Midterm Exam',                  score: 96,  maxScore: 100, weightPct: 25, type: 'exam',    date: '2026-04-09' },
    { subject: 'Data Structures', title: 'Project – Data Structure Lib', score: 100, maxScore: 100, weightPct: 20, type: 'project', date: '2026-04-18' },
    { subject: 'Data Structures', title: 'Quiz Set (1–4)',                score: 9.5, maxScore: 10,  weightPct: 15, type: 'quiz',    date: '2026-04-01' },
    { subject: 'Data Structures', title: 'Lab Average (1–3)',             score: 96,  maxScore: 100, weightPct: 10, type: 'homework',date: '2026-03-25' },
    // Discrete Mathematics — avg ~96
    { subject: 'Discrete Mathematics', title: 'Exam 1 – Logic & Proofs',  score: 95, maxScore: 100, weightPct: 30, type: 'exam',     date: '2026-03-12' },
    { subject: 'Discrete Mathematics', title: 'Exam 2 – Graph Theory',    score: 96, maxScore: 100, weightPct: 30, type: 'exam',     date: '2026-04-16' },
    { subject: 'Discrete Mathematics', title: 'Homework Average (1–5)',   score: 9.8, maxScore: 10, weightPct: 20, type: 'homework', date: '2026-04-25' },
    // Software Engineering — avg ~97
    { subject: 'Software Engineering', title: 'Sprint 1 Review',       score: 98, maxScore: 100, weightPct: 20, type: 'project', date: '2026-03-07' },
    { subject: 'Software Engineering', title: 'Requirements Document', score: 95, maxScore: 100, weightPct: 15, type: 'project', date: '2026-02-28' },
    { subject: 'Software Engineering', title: 'Sprint 2 Review',       score: 97, maxScore: 100, weightPct: 20, type: 'project', date: '2026-04-11' },
    // Physics II — avg ~95
    { subject: 'Physics II', title: 'Exam 1 – Electrostatics', score: 93,  maxScore: 100, weightPct: 25, type: 'exam',     date: '2026-03-10' },
    { subject: 'Physics II', title: 'Exam 2 – Magnetism',      score: 95,  maxScore: 100, weightPct: 25, type: 'exam',     date: '2026-04-14' },
    { subject: 'Physics II', title: 'Lab Average (1–3)',        score: 9.8, maxScore: 10,  weightPct: 20, type: 'homework', date: '2026-04-20' },
  ];
  for (const g of grades) await post('/grades', g, token);
  console.log('✓ Grades created');

  // ── 6. Planner ─────────────────────────────────────────────────────────────
  // Today: Sat May 2, 2026  |  Next week: Mon May 4 – Fri May 8
  const planner = [
    // Week of May 4
    { title: 'Advanced Programming',        date: '2026-05-04', hour: 9,  duration: 2, color: '#6366f1' },
    { title: 'Data Structures Lab',         date: '2026-05-04', hour: 11, duration: 2, color: '#f59e0b' },
    { title: 'Study – Final Project',       date: '2026-05-04', hour: 16, duration: 2, color: '#6366f1' },
    { title: 'Multivariable Calculus',      date: '2026-05-05', hour: 8,  duration: 2, color: '#10b981' },
    { title: 'Software Engineering',        date: '2026-05-05', hour: 11, duration: 2, color: '#8b5cf6' },
    { title: 'Sprint Review Prep',          date: '2026-05-05', hour: 16, duration: 2, color: '#8b5cf6' },
    { title: 'Physics II',                  date: '2026-05-06', hour: 10, duration: 2, color: '#06b6d4' },
    { title: 'Discrete Mathematics',        date: '2026-05-06', hour: 13, duration: 2, color: '#ef4444' },
    { title: 'Study – Problem Set 7',       date: '2026-05-06', hour: 17, duration: 2, color: '#10b981' },
    { title: 'Advanced Programming',        date: '2026-05-07', hour: 9,  duration: 2, color: '#6366f1' },
    { title: 'Sprint Presentation',         date: '2026-05-07', hour: 14, duration: 1, color: '#8b5cf6' },
    { title: 'Algorithm Report – Writing',  date: '2026-05-08', hour: 10, duration: 2, color: '#f59e0b' },
    { title: 'Physics Lab #4',              date: '2026-05-08', hour: 15, duration: 2, color: '#06b6d4' },
    // Week of May 11
    { title: 'Advanced Programming',        date: '2026-05-11', hour: 9,  duration: 2, color: '#6366f1' },
    { title: 'Data Structures',             date: '2026-05-11', hour: 11, duration: 2, color: '#f59e0b' },
    { title: 'Multivariable Calculus',      date: '2026-05-12', hour: 8,  duration: 2, color: '#10b981' },
    { title: 'Study – Calc Exam 3',         date: '2026-05-12', hour: 16, duration: 3, color: '#10b981' },
    { title: 'Physics II',                  date: '2026-05-13', hour: 10, duration: 2, color: '#06b6d4' },
    { title: 'Discrete Mathematics',        date: '2026-05-13', hour: 13, duration: 2, color: '#ef4444' },
    { title: 'Exam 3 – Multivariable Calc', date: '2026-05-14', hour: 9,  duration: 2, color: '#10b981' },
    { title: 'Study – DS Final',            date: '2026-05-14', hour: 15, duration: 2, color: '#f59e0b' },
    { title: 'DS Graph Theory Review',      date: '2026-05-15', hour: 10, duration: 3, color: '#f59e0b' },
  ];
  for (const p of planner) await post('/planner', p, token);
  console.log('✓ Planner events created');

  console.log('\n✅ Done! Demo account ready:\n');
  console.log('   Email:    demo@weekfive.app');
  console.log('   Password: WeekFive2026!\n');
}

main().catch(console.error);
