import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useTaskStore } from '../store/useTaskStore';
import { useSubjectStore } from '../store/useSubjectStore';
import { useExamStore } from '../store/useExamStore';
import { useNotificationStore } from '../store/useNotificationStore';

export default function MainLayout() {
  useEffect(() => {
    useTaskStore.getState().hydrate();
    useSubjectStore.getState().hydrate();
    useExamStore.getState().hydrate();
    useNotificationStore.getState().hydrate();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
