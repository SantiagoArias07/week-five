# WeekFive — Academic Manager

> A full-stack web application that helps students organize their entire academic life in one place: tasks, exams, grades, study sessions, and a weekly planner — with real-time persistence and bilingual (EN/ES) support.

**Live demo →** [weekfive-nine.vercel.app](https://weekfive-nine.vercel.app)

---

## Screenshots

<div align="center">
    <img src="https://github.com/user-attachments/assets/d5886a80-aab8-42c5-8b9d-63eda9b893b9"        
  width="48%" alt="Dashboard" />       
    <img src="https://github.com/user-attachments/assets/92b22a77-5afd-4a68-84a6-dbb990f5e03f" 
  width="48%" alt="Planner" />         
    <br/><br/>                       
    <img src="https://github.com/user-attachments/assets/a0f62430-aa28-43b4-86bf-32afcf2928ef"        
  width="48%" alt="Exams" />         
    <img src="https://github.com/user-attachments/assets/f3dd61f2-4199-4093-a253-bf88743501e9" 
  width="48%" alt="Grades" />          
    <br/><br/>
    <img src="https://github.com/user-attachments/assets/c75ce846-ebdd-483b-8177-48ec254d8151"        
  width="48%" alt="Tasks" />         
    <img src="https://github.com/user-attachments/assets/c5571cd6-95c5-4558-91b6-06b33b73d6e0" 
  width="48%" alt="Subjects" />
  </div>

---

## Features

| Page | What it does |
|------|-------------|
| **Dashboard** | Greeting banner, overall task progress bar, upcoming events (next 7 days), subject progress bars, grade summary widget |
| **Subjects** | Color-coded subject cards; each subject has a detail page with tabs for notes, teacher info, exam tips, and resource links |
| **Tasks** | Full CRUD — add, filter by status/priority/subject, mark complete, delete; overdue detection |
| **Planner** | Weekly and monthly calendar; click any cell to create an event; tasks and exams appear automatically as all-day items |
| **Exams** | Add exams with weight %, room, and topics; priority badge (High/Med/Low) based on weight × urgency; study plan generator creates planner prep sessions |
| **Grades** | Log grades by subject with weight %; weighted GPA calculated automatically; letter grade (A–F) per subject |
| **Study Mode** | 25-minute Pomodoro timer with 5-minute break; session counter; weekly study-hours bar chart per subject |
| **Settings** | Dark mode toggle, language switch (EN/ES), profile name & email |
| **Notifications** | Auto-generated from upcoming tasks and exams; unread badge on bell icon |
| **Search** | Global search across tasks, subjects, and exams from the top bar |

---

## Tech Stack

### Frontend
| Technology | Role |
|-----------|------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling — fully responsive (mobile + desktop) |
| Zustand | Client state — one store per resource (tasks, exams, grades, …) |
| React Router v6 | Client-side routing |
| Lucide React | Icon library |

### Backend
| Technology | Role |
|-----------|------|
| Node.js + Express | REST API server |
| SQLite (`node:sqlite`) | Embedded persistent database |
| JWT | Stateless authentication |
| bcryptjs | Password hashing |

### Deployment
| Service | Role |
|---------|------|
| Vercel | React SPA — auto-deploys from `main`; `vercel.json` proxies `/api/*` to Railway and serves `/index.html` for all other routes |
| Railway | Express API + SQLite on a persistent Volume |

---

## Architecture

```
week-five/
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, TopBar, ExamCard, NotificationsDropdown, …
│   │   ├── features/tasks/  # Task list, filters, add-task modal
│   │   ├── hooks/           # useT() — i18n translation hook
│   │   ├── i18n/            # EN/ES string maps
│   │   ├── layouts/         # MainLayout (sidebar + topbar shell)
│   │   ├── pages/           # One file per route
│   │   ├── store/           # Zustand stores (useTaskStore, useExamStore, …)
│   │   ├── types/           # TypeScript interfaces (Task, Exam, Grade, …)
│   │   └── utils/           # api.ts fetch wrapper
│   ├── .env.production      # VITE_API_URL → Railway backend
│   └── vercel.json          # API proxy rewrite + SPA fallback
│
└── backend/
    ├── db/database.js       # SQLite init — CREATE TABLE IF NOT EXISTS on startup
    ├── middleware/auth.js   # JWT verification
    ├── routes/              # auth, tasks, subjects, exams, grades, planner, …
    └── index.js             # Express app entry point
```

**Data flow:** User action → Zustand store → `api.ts` fetch → Express route → SQLite → JSON → store update → React re-render.

---

## Key Design Decisions

**Zustand over Redux:** Each resource has its own small store with hydration, CRUD methods, and local filter state — no boilerplate reducers or action creators.

**Dual-environment API routing:** In development, Vite proxies `/api/*` to `localhost:5001`. In production, `vercel.json` rewrites `/api/:path*` to the Railway backend before the SPA catch-all — same relative paths work in both environments without any conditional code.

**SQLite on Railway Volume:** Zero-config embedded database — no external service, no connection string. The `.db` file lives on a Railway persistent Volume so data survives both restarts and redeploys.

**JWT in localStorage:** The `api.ts` wrapper injects the token on every request and redirects to `/login` on any 401, keeping auth logic in one place.

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

---

## Running Locally

> The app is already live at [weekfive-nine.vercel.app](https://weekfive-nine.vercel.app) — local setup is only needed for development.

**Backend**
```bash
cd backend && npm install && node index.js
# → http://localhost:5001
```

**Frontend**
```bash
cd frontend && npm install && npm run dev
# → http://localhost:5173  (proxies /api/* to localhost:5001)
```

---

## About the name

*Week Five* is a Tecnológico de Monterrey tradition — the fifth week of every semester is when all major exams, projects, and deadlines converge at once. This app was built to survive it.

---

## License

MIT
