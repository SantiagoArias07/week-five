import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing } = useAuthStore();
  const [slow, setSlow] = useState(false);

  // The free-tier backend may be asleep; after a few seconds, reassure the
  // visitor that we're waking it up rather than showing a bare spinner.
  useEffect(() => {
    if (!initializing) return;
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [initializing]);

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4 px-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
          <GraduationCap size={24} className="text-white" />
        </div>
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
          {slow
            ? 'Waking up the server… the first load can take up to a minute.'
            : 'Preparing your workspace…'}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
