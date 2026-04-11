import { ClipboardList } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import TaskCard from '../../components/TaskCard';

export default function TaskList() {
  const { toggleStatus, deleteTask, getFilteredTasks } = useTaskStore();
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <ClipboardList size={24} className="text-gray-400" />
        </div>
        <p className="font-medium text-gray-700">No tasks found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try changing your filters or add a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={toggleStatus}
          onDelete={deleteTask}
        />
      ))}
    </div>
  );
}
