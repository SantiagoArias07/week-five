export interface Task {
  id: string;
  title: string;
  description?: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  teacher: string;
  taskCount: number;
  credits: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  date: string;
  topics: string[];
  room: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'exam';
  read: boolean;
  createdAt: string;
}

export interface UserSettings {
  darkMode: boolean;
  language: string;
  pushNotifications: boolean;
  emailReminders: boolean;
  soundEffects: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export type FilterStatus = 'all' | 'todo' | 'in-progress' | 'done';
export type FilterPriority = 'all' | 'low' | 'medium' | 'high';
