import { create } from 'zustand';
import { api } from '../utils/api';
import { Notification } from '../types';

interface NotificationStore {
  notifications: Notification[];
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  hydrate: async () => {
    try {
      const notifications = await api.get<Notification[]>('/notifications');
      set({ notifications });
    } catch {
      // silently fail
    }
  },

  refresh: async () => {
    try {
      const notifications = await api.post<Notification[]>('/notifications/refresh', {});
      set({ notifications });
    } catch {
      // silently fail
    }
  },

  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    await api.put(`/notifications/${id}/read`, {}).catch(() => {});
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    await api.put('/notifications/read-all', {}).catch(() => {});
  },
}));
