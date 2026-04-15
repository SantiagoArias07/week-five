import { Plus, BookOpen } from 'lucide-react';
import { useSubjectStore } from '../store/useSubjectStore';
import SubjectCard from '../components/SubjectCard';
import { useT } from '../hooks/useT';

export default function Subjects() {
  const { subjects, isLoading } = useSubjectStore();
  const t = useT();

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalTasks = subjects.reduce((sum, s) => sum + s.taskCount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('subjects_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {subjects.length} {t('nav_subjects').toLowerCase()} · {totalCredits} {t('dash_credits')} · {totalTasks} {t('common_tasks')}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
          <Plus size={16} />
          {t('subjects_add')}
        </button>
      </div>

      {/* Summary bar */}
      {subjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="font-semibold text-gray-900 dark:text-white">{subjects.length}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-100 dark:bg-gray-700" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dash_credits')}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{totalCredits}</p>
          </div>
          <div className="h-8 w-px bg-gray-100 dark:bg-gray-700" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('common_tasks')}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{totalTasks}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {subjects.map((s) => (
              <div key={s.id} className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} title={s.name} />
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-36 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500">{t('subjects_no_subjects')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}
