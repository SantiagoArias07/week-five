import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, BookOpen, AlertTriangle, Info, CheckSquare } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';
import { useT } from '../hooks/useT';

interface Props {
  onClose: () => void;
}

const typeIcon = {
  info: <Info size={13} className="text-blue-500" />,
  warning: <AlertTriangle size={13} className="text-amber-500" />,
  exam: <BookOpen size={13} className="text-indigo-500" />,
  task: <CheckSquare size={13} className="text-emerald-500" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsDropdown({ onClose }: Props) {
  const { notifications, markRead, markAllRead, hydrate } = useNotificationStore();
  const ref = useRef<HTMLDivElement>(null);
  const t = useT();

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
      className="absolute right-0 top-9 w-80 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('notif_title')}</span>
          {unread > 0 && (
            <span className="text-xs font-medium text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            <CheckCheck size={12} />
            {t('notif_mark_all')}
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bell size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('notif_empty')}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors flex items-start gap-3 ${
                !n.read
                  ? 'bg-indigo-50/40 dark:bg-indigo-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {typeIcon[n.type] ?? typeIcon.info}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${!n.read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">{timeAgo(n.createdAt)}</p>
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
