import { ClipboardList } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import TaskCard from '../../components/TaskCard';
import { useT } from '../../hooks/useT';

export default function TaskList() {
  const { toggleStatus, deleteTask, getFilteredTasks } = useTaskStore();
  const filteredTasks = getFilteredTasks();
  const t = useT();

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
          <ClipboardList size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="font-medium text-gray-700 dark:text-gray-300">{t('tasks_empty')}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('tasks_empty_sub')}</p>
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
