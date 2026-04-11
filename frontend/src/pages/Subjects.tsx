import { Plus, BookOpen } from 'lucide-react';
import { mockSubjects } from '../utils/mockData';
import SubjectCard from '../components/SubjectCard';

export default function Subjects() {
  const totalCredits = mockSubjects.reduce((sum, s) => sum + s.credits, 0);
  const totalTasks = mockSubjects.reduce((sum, s) => sum + s.taskCount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 mt-0.5">
            {mockSubjects.length} subjects &middot; {totalCredits} credits &middot; {totalTasks} tasks
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {/* Summary bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <BookOpen size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Subjects</p>
            <p className="font-semibold text-gray-900">{mockSubjects.length}</p>
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
        {/* Color legend */}
        <div className="ml-auto flex items-center gap-2">
          {mockSubjects.map((s) => (
            <div
              key={s.id}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.color }}
              title={s.name}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSubjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  );
}
