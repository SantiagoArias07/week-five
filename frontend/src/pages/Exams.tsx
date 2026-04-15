import { Plus, ClipboardList } from 'lucide-react';
import { useExamStore } from '../store/useExamStore';
import ExamCard from '../components/ExamCard';
import { useT } from '../hooks/useT';

export default function Exams() {
  const { exams, isLoading } = useExamStore();
  const t = useT();

  const upcoming = exams.slice(0, 2);
  const later = exams.slice(2);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('exams_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">{exams.length} {t('exams_title').toLowerCase()} scheduled this semester</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
          <Plus size={16} />
          Add {t('common_exam')}
        </button>
      </div>

      {/* Alert */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <ClipboardList size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Heads up!</span> You have{' '}
            {upcoming.length} {t('common_exam').toLowerCase()}{upcoming.length !== 1 ? 's' : ''} coming up soon. Start reviewing early.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-40 animate-pulse">
              <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t('exams_next_up')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcoming.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            </section>
          )}

          {later.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t('exams_later')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {later.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            </section>
          )}

          {exams.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500">{t('exams_no_exams')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
