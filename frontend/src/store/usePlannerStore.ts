import { create } from 'zustand';
import { api } from '../utils/api';
import { PlannerEvent } from '../types';

interface PlannerStore {
  events: PlannerEvent[];
  hydrate: () => Promise<void>;
  addEvent: (event: Omit<PlannerEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Omit<PlannerEvent, 'id'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  events: [],

  hydrate: async () => {
    try {
      const events = await api.get<PlannerEvent[]>('/planner');
      set({ events });
    } catch {
      // silently fail
    }
  },

  addEvent: async (event) => {
    const saved = await api.post<PlannerEvent>('/planner', event);
    set((state) => ({ events: [...state.events, saved] }));
  },

  updateEvent: async (id, updates) => {
    const prev = get().events;
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    try {
      await api.put(`/planner/${id}`, updates);
    } catch {
      set({ events: prev });
    }
  },

  deleteEvent: async (id) => {
    const prev = get().events;
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
    try {
      await api.del(`/planner/${id}`);
    } catch {
      set({ events: prev });
    }
  },
}));
