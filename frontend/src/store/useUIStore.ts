import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../i18n';

interface UIStore {
  darkMode: boolean;
  language: Language;
  sidebarCollapsed: boolean;
  setDarkMode: (value: boolean) => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      darkMode: false,
      language: 'en',
      sidebarCollapsed: false,

      setDarkMode: (value) => {
        document.documentElement.classList.toggle('dark', value);
        set({ darkMode: value });
      },

      setLanguage: (lang) => set({ language: lang }),

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'wf-ui-store',
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
