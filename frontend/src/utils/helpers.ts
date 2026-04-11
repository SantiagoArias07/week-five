export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getDaysUntil = (date: string): number => {
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getPriorityClasses = (priority: string): string => {
  const map: Record<string, string> = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-green-600 bg-green-50',
  };
  return map[priority] ?? 'text-gray-600 bg-gray-100';
};

export const getStatusClasses = (status: string): string => {
  const map: Record<string, string> = {
    todo: 'text-gray-600 bg-gray-100',
    'in-progress': 'text-blue-600 bg-blue-50',
    done: 'text-green-600 bg-green-50',
  };
  return map[status] ?? 'text-gray-600 bg-gray-100';
};

export const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
  };
  return map[status] ?? status;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};
