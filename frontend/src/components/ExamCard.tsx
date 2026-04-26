import { MapPin, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { Exam } from '../types';
import { useT } from '../hooks/useT';

interface ExamCardProps {
  exam: Exam;
  onStudyPlan?: (exam: Exam) => void;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function priorityScore(exam: Exam): number {
  const d = Math.max(1, daysUntil(exam.date));
  return (exam.weightPct ?? 0) * (100 / d);
}

export default function ExamCard({ exam, onStudyPlan }: ExamCardProps) {
  const t = useT();
  const days = daysUntil(exam.date);
  const score = priorityScore(exam);

  const priorityBadge = score >= 200
    ? { label: t('exams_priority_high'), cls: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' }
    : score >= 50
    ? { label: t('exams_priority_med'), cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' }
    : score > 0
    ? { label: t('exams_priority_low'), cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' }
    : null;

  const urgencyLabel = days === 0 ? t('common_today')
    : days === 1 ? t('common_tomorrow')
    : days > 0 ? `${days} ${t('common_days')}`
    : null;

  const urgencyCls = days === 0 ? 'text-red-500'
    : days === 1 ? 'text-amber-500'
    : days <= 3 ? 'text-amber-400'
    : 'text-gray-400 dark:text-gray-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Subject + weight + priority */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${exam.subjectColor}20`, color: exam.subjectColor }}
        >
          {exam.subject}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {exam.weightPct > 0 && (
            <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {exam.weightPct}%
            </span>
          )}
          {priorityBadge && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityBadge.cls}`}>
              {priorityBadge.label}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{exam.title}</h3>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span>{exam.date}</span>
          {urgencyLabel && (
            <span className={`ml-auto text-xs font-semibold ${urgencyCls}`}>
              {urgencyLabel}
            </span>
          )}
        </div>
        {exam.room && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin size={13} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span>{exam.room}</span>
          </div>
        )}
      </div>

      {/* Topics */}
      {exam.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {exam.topics.map((topic) => (
            <span
              key={topic}
              className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Study Plan button */}
      {onStudyPlan && (
        <button
          onClick={() => onStudyPlan(exam)}
          className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all hover:opacity-90"
          style={{ backgroundColor: `${exam.subjectColor}18`, color: exam.subjectColor }}
        >
          <BookOpen size={12} />
          {t('exams_study_plan')}
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}
