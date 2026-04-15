import { MapPin, Calendar } from 'lucide-react';
import { Exam } from '../types';

interface ExamCardProps {
  exam: Exam;
}

export default function ExamCard({ exam }: ExamCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Subject badge */}
      <span
        className="inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3"
        style={{
          backgroundColor: `${exam.subjectColor}20`,
          color: exam.subjectColor,
        }}
      >
        {exam.subject}
      </span>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{exam.title}</h3>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-gray-400 dark:text-gray-500" />
          <span>{exam.date}</span>
        </div>
        {exam.room && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin size={13} className="text-gray-400 dark:text-gray-500" />
            <span>{exam.room}</span>
          </div>
        )}
      </div>

      {/* Topics */}
      {exam.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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
    </div>
  );
}
