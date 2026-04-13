import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Subjects from '../pages/Subjects';
import SubjectDetail from '../pages/SubjectDetail';
import Tasks from '../pages/Tasks';
import Planner from '../pages/Planner';
import Exams from '../pages/Exams';
import StudyMode from '../pages/StudyMode';
import Settings from '../pages/Settings';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'subjects', element: <Subjects /> },
      { path: 'subjects/:id', element: <SubjectDetail /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'planner', element: <Planner /> },
      { path: 'exams', element: <Exams /> },
      { path: 'study', element: <StudyMode /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);
