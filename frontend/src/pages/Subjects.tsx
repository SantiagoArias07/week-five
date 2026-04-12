import { Plus, BookOpen } from 'lucide-react';
import { useSubjectStore } from '../store/useSubjectStore';
import SubjectCard from '../components/SubjectCard';

export default function Subjects() {
  const { subjects, isLoading } = useSubjectStore();

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalTasks = subjects.reduce((sum, s) => sum + s.taskCount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 mt-0.5">
            {subjects.length} subjects &middot; {totalCredits} credits &middot; {totalTasks} tasks
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {/* Summary bar */}
      {subjects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Subjects</p>
              <p className="font-semibold text-gray-900">{subjects.length}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div>
            <p className="text-xs text-gray-500">Total Credits</p>
            <p className="font-semibold text-gray-900">{totalCredits}</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div>
            <p className="text-xs text-gray-500">Open Tasks</p>
            <p className="font-semibold text-gray-900">{totalTasks}</p>
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
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-36 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-lg mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
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
