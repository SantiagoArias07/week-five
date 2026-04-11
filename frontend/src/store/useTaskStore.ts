import { create } from 'zustand';
import { Task, FilterStatus, FilterPriority } from '../types';
import { mockTasks } from '../utils/mockData';
import { generateId } from '../utils/helpers';

interface TaskFilters {
  status: FilterStatus;
  priority: FilterPriority;
  search: string;
}

interface TaskStore {
  tasks: Task[];
  filters: TaskFilters;

  // CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleStatus: (id: string) => void;

  // Filters
  setFilterStatus: (status: FilterStatus) => void;
  setFilterPriority: (priority: FilterPriority) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;

  // Derived
  getFilteredTasks: () => Task[];
}

const defaultFilters: TaskFilters = {
  status: 'all',
  priority: 'all',
  search: '',
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,
  filters: defaultFilters,

  addTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        { ...task, id: generateId(), createdAt: new Date().toISOString().split('T')[0] },
      ],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  toggleStatus: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== id) return t;
        const next: Task['status'] =
          t.status === 'todo' ? 'in-progress' : t.status === 'in-progress' ? 'done' : 'todo';
        return { ...t, status: next };
      }),
    })),

  setFilterStatus: (status) =>
    set((state) => ({ filters: { ...state.filters, status } })),

  setFilterPriority: (priority) =>
    set((state) => ({ filters: { ...state.filters, priority } })),

  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),

  resetFilters: () => set({ filters: defaultFilters }),

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((t) => {
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  },
}));
