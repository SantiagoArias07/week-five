# WeekFive — Academic Manager

> A full-stack web application that helps students organize their entire academic life in one place: tasks, exams, grades, study sessions, and a weekly planner — all with real-time persistence and bilingual (EN/ES) support.

**Live:** [weekfive-nine.vercel.app](https://weekfive-nine.vercel.app) · Frontend on Vercel · Backend on Railway

---

## Features

| Area | What it does |
|------|-------------|
| **Dashboard** | Greeting banner, overall task progress bar, upcoming events for the next 7 days, subject progress, grade summary widget |
| **Subjects** | Color-coded subject cards; each subject has a detail page with tabs for notes, teacher info, exam tips, and resource links |
| **Tasks** | Full CRUD — add, filter by status/priority/subject, mark complete, delete; overdue detection |
| **Planner** | Weekly (Mon–Sun) and monthly calendar; click any cell to add an event; tasks and exams appear automatically as all-day items |
| **Exams** | Add exams with weight %, room, and topics; priority badge (High/Med/Low) based on weight × urgency; study plan generator creates planner prep sessions |
| **Grades** | Log grades by subject with weight %; weighted GPA calculated automatically; letter grade (A–F) per subject |
| **Study Mode** | 25-minute Pomodoro timer with 5-minute break; session counter; weekly study-hours bar chart per subject |
| **Settings** | Dark mode, language switch (EN/ES), profile name & email |
| **Notifications** | Auto-generated from upcoming tasks and exams; unread badge on the bell icon |
| **Search** | Global search across tasks, subjects, and exams from the top bar |

---

## Tech Stack

### Frontend
| Technology | Role |
|-----------|------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling, fully responsive (mobile + desktop) |
| Zustand | Client state — one store per resource (tasks, exams, grades, …) |
| React Router v6 | Client-side routing |
| Lucide React | Icon library |

### Backend
| Technology | Role |
|-----------|------|
| Node.js + Express | REST API server |
| SQLite (`better-sqlite3`) | Embedded persistent database |
| JWT | Stateless authentication |
| bcryptjs | Password hashing |

### Deployment
| Service | What it hosts |
|---------|--------------|
| Vercel | React SPA — automatic deploys from `main`; `vercel.json` proxies `/api/*` to Railway and serves `/index.html` for all other routes |
| Railway | Express API + SQLite database — always-on free tier |

---

## Architecture

```
week-five/
├── frontend/                  # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/        # Sidebar, TopBar, ExamCard, NotificationsDropdown, …
│   │   ├── features/tasks/    # Task list, filters, add-task modal
│   │   ├── hooks/             # useT() — i18n translation hook
│   │   ├── i18n/              # EN/ES string maps
│   │   ├── layouts/           # MainLayout (sidebar + topbar shell)
│   │   ├── pages/             # One file per route
│   │   ├── store/             # Zustand stores (useTaskStore, useExamStore, …)
│   │   ├── types/             # TypeScript interfaces (Task, Exam, Grade, …)
│   │   └── utils/             # api.ts fetch wrapper, mockData.ts
│   ├── .env.production        # VITE_API_URL → Railway backend URL
│   └── vercel.json            # API proxy rewrite + SPA fallback
│
└── backend/                   # Node.js + Express
    ├── db/database.js         # SQLite init — CREATE TABLE IF NOT EXISTS on startup
    ├── middleware/auth.js     # JWT verification middleware
    ├── routes/                # auth, tasks, subjects, exams, grades, planner, …
    └── index.js               # Express app, CORS config, route mounting
```

**Data flow:** User action → Zustand store method → `api.ts` fetch → Express route → SQLite → JSON response → store updates → React re-renders.

---

## API Reference

All endpoints require `Authorization: Bearer <token>` (except `/api/auth/*`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → returns JWT |
| GET / POST | `/api/tasks` | List / create tasks |
| PUT / DELETE | `/api/tasks/:id` | Update / delete task |
| GET / POST | `/api/subjects` | List / create subjects |
| GET / POST | `/api/exams` | List / create exams |
| GET / POST | `/api/grades` | List / create grades |
| GET / POST | `/api/planner` | List / create planner events |
| GET / PUT | `/api/settings` | Read / update user settings |
| GET | `/api/notifications` | Auto-generated notifications |
| GET | `/api/test` | Health check |

---

## Key Design Decisions

**Zustand over Redux:** Each resource has its own small store with hydration, CRUD methods, and local filter state — no boilerplate reducers or action creators needed.

**Dual-environment API routing:** In development, Vite proxies `/api/*` to `localhost:5001`. In production, `vercel.json` rewrites `/api/:path*` to the Railway backend before the SPA catch-all, so the same relative paths work in both environments.

**SQLite on Railway:** Zero-config embedded database — no external service, no connection strings. Data persists across container restarts. For production-grade durability, attach a Railway Volume so the `.db` file survives redeploys.

**JWT in localStorage:** The `api.ts` wrapper injects the token on every request and automatically redirects to `/login` on any 401 response.

---

## Running Locally

> The live app at [weekfive-nine.vercel.app](https://weekfive-nine.vercel.app) is already deployed — you only need this for development.

### Prerequisites
- Node.js 18+

### Backend

```bash
cd backend
npm install
node index.js
# API available at http://localhost:5001
# SQLite file auto-created at backend/weekfive.db
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:5173
# /api/* requests are proxied to localhost:5001 via Vite
```

---

## Screenshots

> Add screenshots here — drag images directly into this README on GitHub.

---

## License

MIT
