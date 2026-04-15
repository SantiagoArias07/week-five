import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import TaskFilters from '../features/tasks/TaskFilters';
import TaskList from '../features/tasks/TaskList';
import AddTaskModal from '../features/tasks/AddTaskModal';
import { useT } from '../hooks/useT';

export default function Tasks() {
  const [modalOpen, setModalOpen] = useState(false);
  const { tasks, getFilteredTasks } = useTaskStore();
  const t = useT();

  const total = tasks.length;
  const done = tasks.filter((ta) => ta.status === 'done').length;
  const inProgress = tasks.filter((ta) => ta.status === 'in-progress').length;
  const todo = tasks.filter((ta) => ta.status === 'todo').length;
  const filtered = getFilteredTasks().length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tasks_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">{t('tasks_subtitle')}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          {t('tasks_add')}
        </button>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', count: total, color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-100 dark:bg-gray-700' },
          { label: t('tasks_todo'), count: todo, color: 'text-gray-600 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-700' },
          { label: t('tasks_in_progress'), count: inProgress, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: t('tasks_done'), count: done, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4">
        <TaskFilters />
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">
        {filtered} / {total} {t('common_tasks')}
      </p>

      {/* Task list */}
      <TaskList />

      {/* Modal */}
      <AddTaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
