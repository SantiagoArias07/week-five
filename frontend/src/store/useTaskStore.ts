import { create } from 'zustand';
import { api } from '../utils/api';
import { Task, FilterStatus, FilterPriority } from '../types';

interface TaskFilters {
  status: FilterStatus;
  priority: FilterPriority;
  search: string;
}

interface TaskStore {
  tasks: Task[];
  filters: TaskFilters;
  isLoading: boolean;

  // Data
  hydrate: () => Promise<void>;

  // CRUD (optimistic)
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleStatus: (id: string) => void;

  // Filters
  setFilterStatus: (status: FilterStatus) => void;
  setFilterPriority: (priority: FilterPriority) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;

  // Derived
  getFilteredTasks: () => Task[];
}

const defaultFilters: TaskFilters = { status: 'all', priority: 'all', search: '' };

const nextStatus = (s: Task['status']): Task['status'] =>
  s === 'todo' ? 'in-progress' : s === 'in-progress' ? 'done' : 'todo';

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filters: defaultFilters,
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const tasks = await api.get<Task[]>('/tasks');
      set({ tasks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addTask: async (task) => {
    const saved = await api.post<Task>('/tasks', task);
    set((state) => ({ tasks: [saved, ...state.tasks] }));
  },

  updateTask: async (id, updates) => {
    const prev = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    try {
      await api.put(`/tasks/${id}`, updates);
    } catch {
      set({ tasks: prev });
    }
  },

  deleteTask: async (id) => {
    const prev = get().tasks;
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      await api.del(`/tasks/${id}`);
    } catch {
      set({ tasks: prev });
    }
  },

  toggleStatus: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const status = nextStatus(task.status);
    get().updateTask(id, { status });
  },

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
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      return true;
    });
  },
}));
