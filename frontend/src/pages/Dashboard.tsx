import { CheckSquare, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { mockExams, mockSubjects } from '../utils/mockData';
import StatCard from '../components/StatCard';
import ExamCard from '../components/ExamCard';
import { getPriorityClasses, getStatusClasses, getStatusLabel, formatDate } from '../utils/helpers';

export default function Dashboard() {
  const { tasks } = useTaskStore();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const todayTasks = tasks.filter((t) => t.status !== 'done').slice(0, 5);
  const upcomingExams = mockExams.slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Santiago</h1>
        <p className="text-gray-500 mt-0.5">
          You have <span className="font-medium text-indigo-600">{pendingTasks} pending tasks</span> today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Tasks"
          value={totalTasks}
          icon={CheckSquare}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          label="Completed"
          value={doneTasks}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          trend={`${progressPercent}% done`}
        />
        <StatCard
          label="Subjects"
          value={mockSubjects.length}
          icon={BookOpen}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Upcoming Exams"
          value={mockExams.length}
          icon={ClipboardList}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Overall Progress</h2>
          <span className="text-sm font-medium text-indigo-600">{progressPercent}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{doneTasks} completed</span>
          <span>{pendingTasks} remaining</span>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Today's Tasks</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {todayTasks.length} pending
            </span>
          </div>

          <div className="space-y-2.5">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'high'
                      ? 'bg-red-400'
                      : task.priority === 'medium'
                      ? 'bg-amber-400'
                      : 'bg-green-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400 truncate">{task.subject}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusClasses(task.status)}`}
                  >
                    {getStatusLabel(task.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Upcoming Exams</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {upcomingExams.length} upcoming
            </span>
          </div>

          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${exam.subjectColor}15` }}
                >
                  <ClipboardList size={16} style={{ color: exam.subjectColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{exam.title}</p>
                  <p className="text-xs text-gray-400">{exam.subject}</p>
                </div>
                <span className="text-xs font-medium text-gray-500 flex-shrink-0">{exam.date.split(',')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
