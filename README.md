# WeekFive — Academic Manager

A full-stack web application for students to manage their academic life with focus and structure.

**Stack:** React + Vite + TypeScript · Node.js + Express · TailwindCSS · Zustand · React Router

---

## Project Structure

```
week-five/
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── features/     # Feature-scoped components (tasks/)
│       ├── hooks/        # Custom hooks
│       ├── layouts/      # Page layouts (MainLayout)
│       ├── pages/        # Route-level pages
│       ├── router/       # React Router config
│       ├── store/        # Zustand stores
│       ├── types/        # TypeScript interfaces
│       └── utils/        # Helpers & mock data
└── backend/           # Node.js + Express
    ├── controllers/
    ├── models/
    └── routes/
```

---

## Running the App

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`

### Backend

```bash
cd backend
npm install
npm run dev     # uses nodemon for auto-reload
# or
node index.js
```

Runs at `http://localhost:5000`

Test the API: `GET http://localhost:5000/api/test`

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Stats, today's tasks, upcoming exams |
| `/subjects` | Subjects | Subject cards with color coding |
| `/tasks` | Tasks | Full CRUD + Zustand filters |
| `/planner` | Planner | Weekly calendar view |
| `/exams` | Exams | Exam cards with topics |
| `/study` | Study Mode | Working Pomodoro timer |
| `/settings` | Settings | Toggle placeholders |

---

## State Management (Zustand)

The Tasks page (`/tasks`) is the main showcase for Zustand:

- **Store:** `src/store/useTaskStore.ts`
- **Create:** "Add Task" button → modal form → `addTask()`
- **Read:** filtered task list via `getFilteredTasks()`
- **Update:** click status circle → `toggleStatus()`
- **Delete:** hover task → trash icon → `deleteTask()`
- **Filters:** status tabs, priority dropdown, search input — all in global store
