import { BookOpen, User, Hash, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Subject } from '../types';
import { useT } from '../hooks/useT';

interface SubjectCardProps {
  subject: Subject;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const navigate = useNavigate();
  const t = useT();

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/subjects/${subject.id}`)}
    >
      {/* Icon + badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${subject.color}20` }}
        >
          <BookOpen size={20} style={{ color: subject.color }} />
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
        >
          {subject.credits} {t('dash_credits')}
        </span>
      </div>

      {/* Info */}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
        {subject.name}
      </h3>
      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <User size={13} />
        <span>{subject.teacher}</span>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Hash size={13} />
          <span>{subject.taskCount} {t('common_tasks')}</span>
        </div>
        <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
      </div>
    </div>
  );
}
