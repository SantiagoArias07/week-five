import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Subjects from '../pages/Subjects';
import Tasks from '../pages/Tasks';
import Planner from '../pages/Planner';
import Exams from '../pages/Exams';
import StudyMode from '../pages/StudyMode';
import Settings from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'subjects', element: <Subjects /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'planner', element: <Planner /> },
      { path: 'exams', element: <Exams /> },
      { path: 'study', element: <StudyMode /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);
