import { useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, BookOpen, AlertTriangle, Info } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';

interface Props {
  onClose: () => void;
}

const typeIcon = {
  info: <Info size={13} className="text-blue-500" />,
  warning: <AlertTriangle size={13} className="text-amber-500" />,
  exam: <BookOpen size={13} className="text-indigo-500" />,
};

export default function NotificationsDropdown({ onClose }: Props) {
  const { notifications, markRead, markAllRead, hydrate } = useNotificationStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-9 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">Notifications</span>
          {unread > 0 && (
            <span className="text-xs font-medium text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <CheckCheck size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bell size={24} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                !n.read ? 'bg-indigo-50/40' : ''
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {typeIcon[n.type] ?? typeIcon.info}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${!n.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
              </div>
              {!n.read && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
