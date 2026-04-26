import { create } from 'zustand';
import { api } from '../utils/api';
import { Grade } from '../types';

interface GradeStore {
  grades: Grade[];
  isLoading: boolean;
  hydrate: () => Promise<void>;
  addGrade: (grade: Omit<Grade, 'id' | 'createdAt'>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
}

export const useGradeStore = create<GradeStore>((set, get) => ({
  grades: [],
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const grades = await api.get<Grade[]>('/grades');
      set({ grades, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addGrade: async (grade) => {
    const saved = await api.post<Grade>('/grades', grade);
    set((state) => ({ grades: [saved, ...state.grades] }));
  },

  deleteGrade: async (id) => {
    const prev = get().grades;
    set((state) => ({ grades: state.grades.filter((g) => g.id !== id) }));
    try {
      await api.del(`/grades/${id}`);
    } catch {
      set({ grades: prev });
    }
  },
}));
