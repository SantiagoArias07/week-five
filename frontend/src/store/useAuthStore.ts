import { create } from 'zustand';
import { api } from '../utils/api';
import { AuthUser } from '../types';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initializing: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  initializing: true,

  init: async () => {
    const token = localStorage.getItem('wf_token');
    if (!token) {
      set({ initializing: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await api.get<AuthUser>('/auth/me');
      set({ user, isAuthenticated: true, initializing: false });
    } catch {
      localStorage.removeItem('wf_token');
      set({ user: null, isAuthenticated: false, initializing: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('wf_token', token);
    set({ user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const { token, user } = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
      name,
      email,
      password,
    });
    localStorage.setItem('wf_token', token);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('wf_token');
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
