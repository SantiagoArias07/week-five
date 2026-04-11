import { Trash2, Calendar, Tag } from 'lucide-react';
import { Task } from '../types';
import { getPriorityClasses, getStatusClasses, getStatusLabel, formatDate } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const isDone = task.status === 'done';

  return (
    <div
      className={`bg-white rounded-xl border px-5 py-4 flex items-start gap-4 hover:shadow-sm transition-all duration-150 group ${
        isDone ? 'border-gray-100 opacity-70' : 'border-gray-200'
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
            : 'border-gray-300 hover:border-indigo-400'
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
        <p className={`font-medium text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Subject */}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Tag size={11} />
            {task.subject}
          </span>

          {/* Due date */}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={11} />
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getPriorityClasses(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getStatusClasses(task.status)}`}>
          {getStatusLabel(task.status)}
        </span>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="ml-1 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
