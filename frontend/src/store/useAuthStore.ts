import { create } from 'zustand';
import { api } from '../utils/api';
import { AuthUser } from '../types';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  initializing: boolean;
  init: () => Promise<void>;
  guestLogin: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  initializing: true,

  init: async () => {
    const token = localStorage.getItem('wf_token');
    // No session yet → drop the visitor straight into an isolated guest sandbox
    // so recruiters never hit a login wall while the free-tier server wakes up.
    if (!token) {
      await get().guestLogin();
      return;
    }
    try {
      const user = await api.get<AuthUser>('/auth/me');
      set({ user, isAuthenticated: true, isGuest: localStorage.getItem('wf_guest') === '1', initializing: false });
    } catch {
      localStorage.removeItem('wf_token');
      localStorage.removeItem('wf_guest');
      // Fall back to a fresh guest session rather than bouncing to /login.
      await get().guestLogin();
    }
  },

  guestLogin: async () => {
    try {
      const { token, user } = await api.post<{ token: string; user: AuthUser }>('/auth/guest', {});
      localStorage.setItem('wf_token', token);
      localStorage.setItem('wf_guest', '1');
      set({ user, isAuthenticated: true, isGuest: true, initializing: false });
    } catch {
      set({ user: null, isAuthenticated: false, isGuest: false, initializing: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('wf_token', token);
    localStorage.removeItem('wf_guest');
    set({ user, isAuthenticated: true, isGuest: false });
  },

  register: async (name, email, password) => {
    const { token, user } = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
      name,
      email,
      password,
    });
    localStorage.setItem('wf_token', token);
    localStorage.removeItem('wf_guest');
    set({ user, isAuthenticated: true, isGuest: false });
  },

  logout: () => {
    localStorage.removeItem('wf_token');
    localStorage.removeItem('wf_guest');
    set({ user: null, isAuthenticated: false, isGuest: false });
  },

  setUser: (user) => set({ user }),
}));
