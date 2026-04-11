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

export type FilterStatus = 'all' | 'todo' | 'in-progress' | 'done';
export type FilterPriority = 'all' | 'low' | 'medium' | 'high';
