import { create } from 'zustand';
import { api } from '../utils/api';
import { WeeklyStudyDay } from '../types';

interface StudySessionStore {
  weeklyData: WeeklyStudyDay[];
  loadWeekly: () => Promise<void>;
  addSession: (subject: string, duration: number) => Promise<void>;
}

export const useStudySessionStore = create<StudySessionStore>((set) => ({
  weeklyData: [],

  loadWeekly: async () => {
    try {
      const data = await api.get<WeeklyStudyDay[]>('/study-sessions/weekly');
      set({ weeklyData: data });
    } catch {}
  },

  addSession: async (subject, duration) => {
    const date = new Date().toISOString().split('T')[0];
    try {
      await api.post('/study-sessions', { subject, duration, date });
      const data = await api.get<WeeklyStudyDay[]>('/study-sessions/weekly');
      set({ weeklyData: data });
    } catch {}
  },
}));
