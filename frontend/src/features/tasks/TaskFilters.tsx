import { Search, X } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useT } from '../../hooks/useT';
import { FilterStatus, FilterPriority } from '../../types';

export default function TaskFilters() {
  const { filters, setFilterStatus, setFilterPriority, setSearch, resetFilters } = useTaskStore();
  const t = useT();

  const hasActiveFilters =
    filters.status !== 'all' || filters.priority !== 'all' || filters.search !== '';

  const statusOptions: { label: string; value: FilterStatus }[] = [
    { label: t('tasks_all'), value: 'all' },
    { label: t('tasks_todo'), value: 'todo' },
    { label: t('tasks_in_progress'), value: 'in-progress' },
    { label: t('tasks_done'), value: 'done' },
  ];

  const priorityOptions: { label: string; value: FilterPriority }[] = [
    { label: t('tasks_all_priorities'), value: 'all' },
    { label: t('tasks_high'), value: 'high' },
    { label: t('tasks_medium'), value: 'medium' },
    { label: t('tasks_low'), value: 'low' },
  ];

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-fit">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterStatus(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-150 ${
              filters.status === opt.value
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search + Priority row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('tasks_search')}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:text-white dark:placeholder:text-gray-500 transition-all"
          />
        </div>

        <select
          value={filters.priority}
          onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
          className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all cursor-pointer"
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
