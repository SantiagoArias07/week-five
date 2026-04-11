import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import TaskFilters from '../features/tasks/TaskFilters';
import TaskList from '../features/tasks/TaskList';
import AddTaskModal from '../features/tasks/AddTaskModal';

export default function Tasks() {
  const [modalOpen, setModalOpen] = useState(false);
  const { tasks, getFilteredTasks } = useTaskStore();

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const filtered = getFilteredTasks().length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-0.5">
            Manage your academic tasks with full CRUD &amp; filters
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', count: total, color: 'text-gray-700', bg: 'bg-gray-100' },
          { label: 'To Do', count: todo, color: 'text-gray-600', bg: 'bg-gray-100' },
          { label: 'In Progress', count: inProgress, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Done', count: done, color: 'text-green-700', bg: 'bg-green-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Zustand feature callout */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-5 flex items-start gap-3">
        <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">Z</span>
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-800">Powered by Zustand</p>
          <p className="text-xs text-indigo-600 mt-0.5">
            This page demonstrates global state management: <strong>Create</strong> (+ Add Task),{' '}
            <strong>Read</strong> (task list), <strong>Update</strong> (toggle status), and{' '}
            <strong>Delete</strong> (hover to reveal). Filters live in the store too.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <TaskFilters />
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-3">
        Showing {filtered} of {total} tasks
      </p>

      {/* Task list */}
      <TaskList />

      {/* Modal */}
      <AddTaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
