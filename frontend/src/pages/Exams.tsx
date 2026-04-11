import { Plus, ClipboardList } from 'lucide-react';
import { mockExams } from '../utils/mockData';
import ExamCard from '../components/ExamCard';

export default function Exams() {
  const upcoming = mockExams.filter((_, i) => i < 2);
  const later = mockExams.filter((_, i) => i >= 2);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-500 mt-0.5">
            {mockExams.length} exams scheduled this semester
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} />
          Add Exam
        </button>
      </div>

      {/* Upcoming exams alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <ClipboardList size={18} className="text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Heads up!</span> You have {upcoming.length} exams coming up
          in the next two weeks. Start reviewing early.
        </p>
      </div>

      {/* Next up */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Next Up
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcoming.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </section>

      {/* Later */}
      {later.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Later This Semester
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {later.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
