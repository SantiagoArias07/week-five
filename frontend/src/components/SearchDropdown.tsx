import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, BookOpen, ClipboardList } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useSubjectStore } from '../store/useSubjectStore';
import { useExamStore } from '../store/useExamStore';
import { getPriorityClasses } from '../utils/helpers';

interface Props {
  query: string;
  onClose: () => void;
}

export default function SearchDropdown({ query, onClose }: Props) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const tasks = useTaskStore((s) => s.tasks);
  const subjects = useSubjectStore((s) => s.subjects);
  const exams = useExamStore((s) => s.exams);

  const q = query.toLowerCase();
  const matchedTasks = tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 4);
  const matchedSubjects = subjects.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 3);
  const matchedExams = exams
    .filter((e) => e.title.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q))
    .slice(0, 3);

  const total = matchedTasks.length + matchedSubjects.length + matchedExams.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  if (total === 0) {
    return (
      <div ref={ref} className="absolute left-0 top-10 w-72 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 p-4 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">No results for &ldquo;{query}&rdquo;</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute left-0 top-10 w-72 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
      {matchedTasks.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-3 py-2 bg-gray-50 dark:bg-gray-900/50">
            Tasks
          </p>
          {matchedTasks.map((t) => (
            <button
              key={t.id}
              onClick={() => go('/tasks')}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700/50"
            >
              <CheckSquare size={14} className="text-indigo-400 flex-shrink-0" />
              <span className="text-sm text-gray-800 dark:text-gray-200 truncate flex-1">{t.title}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${getPriorityClasses(t.priority)}`}>
                {t.priority}
              </span>
            </button>
          ))}
        </section>
      )}

      {matchedSubjects.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-3 py-2 bg-gray-50 dark:bg-gray-900/50">
            Subjects
          </p>
          {matchedSubjects.map((s) => (
            <button
              key={s.id}
              onClick={() => go('/subjects')}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700/50"
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{s.name}</span>
            </button>
          ))}
        </section>
      )}

      {matchedExams.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-3 py-2 bg-gray-50 dark:bg-gray-900/50">
            Exams
          </p>
          {matchedExams.map((e) => (
            <button
              key={e.id}
              onClick={() => go('/exams')}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700/50"
            >
              <ClipboardList size={14} className="text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{e.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{e.subject}</p>
              </div>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
