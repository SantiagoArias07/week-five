import { Trash2, Calendar, Tag } from 'lucide-react';
import { Task } from '../types';
import { getPriorityClasses, getStatusClasses, formatDate } from '../utils/helpers';
import { useT } from '../hooks/useT';
import type { TranslationKey } from '../i18n';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_KEY: Record<string, TranslationKey> = {
  high: 'tasks_high',
  medium: 'tasks_medium',
  low: 'tasks_low',
};

const STATUS_KEY: Record<string, TranslationKey> = {
  todo: 'tasks_todo',
  'in-progress': 'tasks_in_progress',
  done: 'tasks_done',
};

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const isDone = task.status === 'done';
  const t = useT();

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border px-5 py-4 flex items-start gap-4 hover:shadow-sm transition-all duration-150 group ${
        isDone
          ? 'border-gray-100 dark:border-gray-700/50 opacity-70'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          isDone
            ? 'bg-green-500 border-green-500'
            : task.status === 'in-progress'
            ? 'border-blue-400'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
        }`}
      >
        {isDone && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {task.subject && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Tag size={11} />
              {task.subject}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Calendar size={11} />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityClasses(task.priority)}`}>
          {t(PRIORITY_KEY[task.priority] ?? 'tasks_medium')}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClasses(task.status)}`}>
          {t(STATUS_KEY[task.status] ?? 'tasks_todo')}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="ml-1 p-1 rounded-md text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
