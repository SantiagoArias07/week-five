import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useT } from '../hooks/useT';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  ClipboardList,
  Brain,
  Settings,
  GraduationCap,
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const t = useT();

  const initials = user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'WF';

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav_home') },
    { path: '/subjects', icon: BookOpen, label: t('nav_subjects') },
    { path: '/tasks', icon: CheckSquare, label: t('nav_tasks') },
    { path: '/planner', icon: Calendar, label: t('nav_planner') },
    { path: '/exams', icon: ClipboardList, label: t('nav_exams') },
    { path: '/study', icon: Brain, label: t('nav_study') },
  ];

  return (
    <aside className="w-60 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 transition-colors duration-200">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">WeekFive</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{t('nav_academic_manager')}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
          {t('nav_menu')}
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={17}
                  className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings size={17} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'} />
              {t('nav_settings')}
            </>
          )}
        </NavLink>

        {/* User Profile */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name ?? 'Student'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{t('nav_student')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
