# WeekFive — Academic Manager

> A full-stack web application that helps students organize their entire academic life in one place: tasks, exams, grades, study sessions, and a weekly planner — all with real-time persistence and bilingual support.

**Live demo:** [weekfive-nine.vercel.app](https://weekfive-nine.vercel.app)

---

## Features

| Area | What it does |
|------|-------------|
| **Dashboard** | Greeting banner, overall task progress, upcoming events for the next 7 days, subject progress bars, grade summary widget |
| **Subjects** | Create color-coded subjects; each subject has its own detail page with tabs for notes, teacher info, exam tips, and resource links |
| **Tasks** | Full CRUD with Zustand — add, filter by status/priority/subject, mark complete, delete; overdue detection |
| **Planner** | Weekly calendar (Mon–Sun) and monthly view; click any cell to add an event; tasks and exams appear automatically as all-day items |
| **Exams** | Add exams with weight %, subject, room, and topics; priority badge (High/Med/Low) based on weight × urgency; study plan generator that creates planner events for prep days |
| **Grades** | Log grades by subject with weight %; weighted GPA calculated automatically; letter grade (A–F) per subject; best-subject highlight |
| **Study Mode** | 25-minute Pomodoro timer with 5-minute break; session counter; weekly bar chart of study hours per subject |
| **Settings** | Dark mode toggle, language switch (EN/ES), profile name & email |
| **Notifications** | Auto-generated from upcoming tasks and exams; unread badge on the bell icon |
| **Search** | Global search across tasks, subjects, and exams from the top bar |

---

## Tech Stack

### Frontend
| Technology | Role |
|-----------|------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Zustand | Client state management (tasks, subjects, exams, etc.) |
| React Router v6 | Client-side routing |
| Lucide React | Icon library |

### Backend
| Technology | Role |
|-----------|------|
| Node.js + Express | REST API server |
| SQLite (via `better-sqlite3`) | Persistent database |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |

### Deployment
| Service | Role |
|---------|------|
| Vercel | Frontend hosting (SPA + API proxy rewrites) |
| Railway | Backend hosting + SQLite persistence |

---

## Architecture

```
week-five/
├── frontend/                  # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/        # Reusable UI (Sidebar, TopBar, ExamCard, …)
│   │   ├── features/tasks/    # Task-specific components (list, filters, modal)
│   │   ├── hooks/             # useT() i18n hook
│   │   ├── i18n/              # EN/ES translation strings
│   │   ├── layouts/           # MainLayout (sidebar + topbar shell)
│   │   ├── pages/             # One file per route
│   │   ├── store/             # Zustand stores (useTaskStore, useExamStore, …)
│   │   ├── types/             # TypeScript interfaces (Task, Exam, Grade, …)
│   │   └── utils/             # api.ts (fetch wrapper), mockData.ts
│   ├── .env.production        # VITE_API_URL → Railway backend
│   └── vercel.json            # /api/* proxy + SPA fallback rewrites
│
└── backend/                   # Node.js + Express
    ├── db/database.js         # SQLite setup + CREATE TABLE IF NOT EXISTS
    ├── middleware/auth.js     # JWT verification middleware
    ├── routes/                # auth, tasks, subjects, exams, grades, …
    └── index.js               # App entry point + CORS config
```

**State flow:** Zustand stores call `api.ts` on every mutation → Express REST endpoints → SQLite. On page load, each store hydrates by calling `GET /api/<resource>`.

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/SantiagoArias07/week-five.git
cd week-five
```

### 2. Start the backend

```bash
cd backend
npm install
node index.js
# Server starts on http://localhost:5001
# SQLite database auto-created at db/weekfive.db
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

The Vite dev server proxies all `/api/*` requests to `localhost:5001` automatically (configured in `vite.config.ts`).

### 4. Create an account

Open `http://localhost:5173`, click **Sign Up**, and create a free account. All data is scoped to your user.

---

## API Overview

All endpoints require a `Authorization: Bearer <token>` header (except `/api/auth/*`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET/POST | `/api/tasks` | List / create tasks |
| PUT/DELETE | `/api/tasks/:id` | Update / delete task |
| GET/POST | `/api/subjects` | List / create subjects |
| GET/POST | `/api/exams` | List / create exams |
| GET/POST | `/api/grades` | List / create grades |
| GET/POST | `/api/planner` | List / create planner events |
| GET/PUT | `/api/settings` | Read / update user settings |
| GET | `/api/notifications` | Auto-generated notifications |

---

## Key Design Decisions

**Zustand over Redux:** Simpler boilerplate for per-resource stores. Each store (`useTaskStore`, `useExamStore`, etc.) owns its own hydration, CRUD methods, and local filter state.

**SQLite on Railway:** Zero configuration, no separate database service, free tier. Data persists across restarts. A Railway Volume is recommended for production-grade persistence across redeploys.

**Vite proxy in dev, vercel.json rewrite in prod:** Dev → Vite forwards `/api` to `localhost:5001`. Prod → Vercel rewrites `/api/:path*` to the Railway backend URL before the SPA catch-all `/(.*) → /index.html`.

**JWT in localStorage:** Standard for SPAs. The `api.ts` wrapper injects the token on every request and redirects to `/login` on 401.

---

## Screenshots

> Add screenshots here after deploying — Vercel preview URLs are perfect for this.

---

## License

MIT
