import { BookOpen, User, Hash } from 'lucide-react';
import { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
      {/* Color stripe + icon */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${subject.color}15` }}
        >
          <BookOpen size={20} style={{ color: subject.color }} />
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
        >
          {subject.credits} credits
        </span>
      </div>

      {/* Info */}
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
        {subject.name}
      </h3>
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
        <User size={13} />
        <span>{subject.teacher}</span>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Hash size={13} />
          <span>{subject.taskCount} tasks</span>
        </div>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
      </div>
    </div>
  );
}
