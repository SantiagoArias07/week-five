import { create } from 'zustand';
import { api } from '../utils/api';
import { Subject } from '../types';

interface SubjectStore {
  subjects: Subject[];
  isLoading: boolean;
  hydrate: () => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id' | 'taskCount'>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
}

export const useSubjectStore = create<SubjectStore>((set, get) => ({
  subjects: [],
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const subjects = await api.get<Subject[]>('/subjects');
      set({ subjects, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addSubject: async (subject) => {
    const saved = await api.post<Subject>('/subjects', subject);
    set((state) => ({ subjects: [...state.subjects, saved] }));
  },

  deleteSubject: async (id) => {
    const prev = get().subjects;
    set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) }));
    try {
      await api.del(`/subjects/${id}`);
    } catch {
      set({ subjects: prev });
    }
  },
}));
