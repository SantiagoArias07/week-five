import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useTaskStore } from '../store/useTaskStore';
import { useSubjectStore } from '../store/useSubjectStore';
import { useExamStore } from '../store/useExamStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { usePlannerStore } from '../store/usePlannerStore';
import { useUIStore } from '../store/useUIStore';
import { api } from '../utils/api';
import { UserSettings } from '../types';

export default function MainLayout() {
  const { setDarkMode, setLanguage, darkMode } = useUIStore();

  useEffect(() => {
    // Apply persisted dark mode immediately
    document.documentElement.classList.toggle('dark', darkMode);

    // Hydrate all stores in parallel
    useTaskStore.getState().hydrate();
    useSubjectStore.getState().hydrate();
    useExamStore.getState().hydrate();
    usePlannerStore.getState().hydrate();

    // Load settings → sync dark mode + language from API
    api.get<UserSettings>('/settings').then((settings) => {
      setDarkMode(settings.darkMode);
      setLanguage(settings.language as 'en' | 'es');
    }).catch(() => {});

    // Refresh notifications (auto-generate from tasks/exams)
    useNotificationStore.getState().refresh();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
