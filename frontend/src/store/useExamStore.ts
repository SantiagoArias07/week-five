import { create } from 'zustand';
import { api } from '../utils/api';
import { Exam } from '../types';

interface ExamStore {
  exams: Exam[];
  isLoading: boolean;
  hydrate: () => Promise<void>;
  addExam: (exam: Omit<Exam, 'id'>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  exams: [],
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const exams = await api.get<Exam[]>('/exams');
      set({ exams, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addExam: async (exam) => {
    const saved = await api.post<Exam>('/exams', exam);
    set((state) => ({ exams: [...state.exams, saved] }));
  },

  deleteExam: async (id) => {
    const prev = get().exams;
    set((state) => ({ exams: state.exams.filter((e) => e.id !== id) }));
    try {
      await api.del(`/exams/${id}`);
    } catch {
      set({ exams: prev });
    }
  },
}));
