import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import NotificationsDropdown from './NotificationsDropdown';
import SearchDropdown from './SearchDropdown';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function TopBar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const initials = user ? getInitials(user.name) : 'WF';

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
      {/* Search */}
      <div ref={searchRef} className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearch(e.target.value.length >= 2);
          }}
          onFocus={() => {
            if (searchQuery.length >= 2) setShowSearch(true);
          }}
          placeholder="Search tasks, subjects, exams..."
          className="pl-9 pr-4 py-1.5 text-sm bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all w-64 text-gray-700 placeholder:text-gray-400"
        />
        {showSearch && searchQuery.length >= 2 && (
          <SearchDropdown
            query={searchQuery}
            onClose={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
          />
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowSearch(false);
            }}
            className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 text-[10px] font-bold text-white bg-indigo-600 rounded-full flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationsDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Avatar → Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center hover:bg-indigo-200 transition-colors"
          title="Go to Settings"
        >
          <span className="text-xs font-semibold text-indigo-700">{initials}</span>
        </button>
      </div>
    </header>
  );
}
