import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, User, Hash, Pin, Trash2, Plus, Pencil,
  CheckSquare, Calendar, Lightbulb, Link2, GraduationCap, Check, X,
} from 'lucide-react';
import { api } from '../utils/api';
import { useSubjectStore } from '../store/useSubjectStore';
import { useTaskStore } from '../store/useTaskStore';
import { useExamStore } from '../store/useExamStore';
import { Subject, SubjectNote, Task, Exam } from '../types';

type Tab = 'overview' | 'notes' | 'teacher' | 'tips';
type NoteCategory = 'general' | 'teacher' | 'tips' | 'resources';

const CATEGORY_META: Record<NoteCategory, { label: string; icon: React.ReactNode; color: string }> = {
  general:   { label: 'General',      icon: <BookOpen size={14} />,     color: 'indigo' },
  teacher:   { label: 'Teacher',      icon: <User size={14} />,         color: 'violet' },
  tips:      { label: 'Exam Tips',    icon: <Lightbulb size={14} />,    color: 'amber'  },
  resources: { label: 'Resources',    icon: <Link2 size={14} />,        color: 'emerald'},
};

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200'  },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200'  },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low:    'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<Task['status'], string> = {
  'todo':        'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'done':        'bg-green-100 text-green-700',
};

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const subjects = useSubjectStore((s) => s.subjects);
  const tasks    = useTaskStore((s) => s.tasks);
  const exams    = useExamStore((s) => s.exams);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [notes, setNotes]     = useState<SubjectNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Note form
  const [addingCategory, setAddingCategory] = useState<NoteCategory | null>(null);
  const [newContent, setNewContent]         = useState('');
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [editContent, setEditContent]       = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load subject + notes
  useEffect(() => {
    if (!id) return;
    const fromStore = subjects.find((s) => s.id === id);
    if (fromStore) setSubject(fromStore);

    (async () => {
      try {
        if (!fromStore) {
          const s = await api.get<Subject>(`/subjects/${id}`);
          setSubject(s);
        }
        const n = await api.get<SubjectNote[]>(`/subjects/${id}/notes`);
        setNotes(n);
      } catch {
        navigate('/subjects');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Focus textarea when adding
  useEffect(() => {
    if (addingCategory && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [addingCategory]);

  const subjectTasks = tasks.filter((t) => t.subject === subject?.name);
  const subjectExams = exams.filter((e) => e.subject === subject?.name);

  const notesByCategory = (cat: NoteCategory) =>
    notes.filter((n) => n.category === cat).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleAddNote = async (category: NoteCategory) => {
    if (!newContent.trim() || !id) return;
    const created = await api.post<SubjectNote>(`/subjects/${id}/notes`, { content: newContent.trim(), category });
    setNotes((prev) => [created, ...prev]);
    setNewContent('');
    setAddingCategory(null);
  };

  const handleTogglePin = async (note: SubjectNote) => {
    const updated = await api.put<SubjectNote>(`/subjects/${id}/notes/${note.id}`, { pinned: !note.pinned });
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
  };

  const handleSaveEdit = async (note: SubjectNote) => {
    if (!editContent.trim()) return;
    const updated = await api.put<SubjectNote>(`/subjects/${id}/notes/${note.id}`, { content: editContent.trim() });
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
    setEditingId(null);
  };

  const handleDelete = async (noteId: string) => {
    await api.del(`/subjects/${id}/notes/${noteId}`);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48 mb-6" />
        <div className="h-32 bg-gray-100 rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!subject) return null;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview',   icon: <BookOpen size={14} /> },
    { key: 'notes',    label: 'Notes',      icon: <Pencil size={14} />   },
    { key: 'teacher',  label: 'Teacher',    icon: <GraduationCap size={14} /> },
    { key: 'tips',     label: 'Exam Tips',  icon: <Lightbulb size={14} /> },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/subjects')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
      >
        <ArrowLeft size={15} />
        Back to Subjects
      </button>

      {/* Header */}
      <div
        className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ backgroundColor: subject.color }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)',
          }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={18} className="opacity-80" />
              <span className="text-sm font-medium opacity-80">Subject</span>
            </div>
            <h1 className="text-2xl font-bold mb-3">{subject.name}</h1>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {subject.teacher || 'No teacher set'}
              </span>
              <span className="flex items-center gap-1.5">
                <Hash size={13} />
                {subject.credits} credits
              </span>
              <span className="flex items-center gap-1.5">
                <CheckSquare size={13} />
                {subjectTasks.length} tasks
              </span>
            </div>
          </div>
          <div className="text-right text-sm opacity-75">
            <p>{notesByCategory('general').length} notes</p>
            <p>{subjectExams.length} exams</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab tasks={subjectTasks} exams={subjectExams} />
      )}
      {activeTab === 'notes' && (
        <NotesTab
          category="general"
          notes={notesByCategory('general')}
          addingCategory={addingCategory}
          newContent={newContent}
          editingId={editingId}
          editContent={editContent}
          textareaRef={textareaRef}
          onStartAdd={() => { setAddingCategory('general'); setNewContent(''); }}
          onCancelAdd={() => setAddingCategory(null)}
          onAdd={() => handleAddNote('general')}
          onNewContentChange={setNewContent}
          onStartEdit={(n) => { setEditingId(n.id); setEditContent(n.content); }}
          onCancelEdit={() => setEditingId(null)}
          onSaveEdit={handleSaveEdit}
          onEditContentChange={setEditContent}
          onPin={handleTogglePin}
          onDelete={handleDelete}
        />
      )}
      {activeTab === 'teacher' && (
        <NotesTab
          category="teacher"
          notes={notesByCategory('teacher')}
          addingCategory={addingCategory}
          newContent={newContent}
          editingId={editingId}
          editContent={editContent}
          textareaRef={textareaRef}
          onStartAdd={() => { setAddingCategory('teacher'); setNewContent(''); }}
          onCancelAdd={() => setAddingCategory(null)}
          onAdd={() => handleAddNote('teacher')}
          onNewContentChange={setNewContent}
          onStartEdit={(n) => { setEditingId(n.id); setEditContent(n.content); }}
          onCancelEdit={() => setEditingId(null)}
          onSaveEdit={handleSaveEdit}
          onEditContentChange={setEditContent}
          onPin={handleTogglePin}
          onDelete={handleDelete}
        />
      )}
      {activeTab === 'tips' && (
        <NotesTab
          category="tips"
          notes={notesByCategory('tips')}
          addingCategory={addingCategory}
          newContent={newContent}
          editingId={editingId}
          editContent={editContent}
          textareaRef={textareaRef}
          onStartAdd={() => { setAddingCategory('tips'); setNewContent(''); }}
          onCancelAdd={() => setAddingCategory(null)}
          onAdd={() => handleAddNote('tips')}
          onNewContentChange={setNewContent}
          onStartEdit={(n) => { setEditingId(n.id); setEditContent(n.content); }}
          onCancelEdit={() => setEditingId(null)}
          onSaveEdit={handleSaveEdit}
          onEditContentChange={setEditContent}
          onPin={handleTogglePin}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ tasks, exams }: { tasks: Task[]; exams: Exam[] }) {
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tasks */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckSquare size={15} className="text-indigo-500" />
          Tasks
          <span className="ml-auto text-xs text-gray-400 font-normal">{tasks.length} total</span>
        </h3>
        {tasks.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            No tasks for this subject
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-start gap-3">
                <div className={`mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                  {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={11} />
                      {task.dueDate}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exams + Stats */}
      <div className="space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'To-do',       value: todoTasks.length,       color: 'text-gray-700' },
            { label: 'In Progress', value: inProgressTasks.length, color: 'text-blue-600'  },
            { label: 'Done',        value: doneTasks.length,        color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Exams */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <GraduationCap size={15} className="text-violet-500" />
            Upcoming Exams
          </h3>
          {exams.length === 0 ? (
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
              No exams scheduled
            </div>
          ) : (
            <div className="space-y-2">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800">{exam.title}</p>
                    <span className="text-xs text-gray-500">{exam.date}</span>
                  </div>
                  {exam.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {exam.topics.slice(0, 4).map((t, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                      {exam.topics.length > 4 && (
                        <span className="text-xs text-gray-400">+{exam.topics.length - 4}</span>
                      )}
                    </div>
                  )}
                  {exam.room && (
                    <p className="text-xs text-gray-400 mt-1">Room: {exam.room}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Notes Tab ───────────────────────────────────────────────────────────────

interface NotesTabProps {
  category: NoteCategory;
  notes: SubjectNote[];
  addingCategory: NoteCategory | null;
  newContent: string;
  editingId: string | null;
  editContent: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onAdd: () => void;
  onNewContentChange: (v: string) => void;
  onStartEdit: (n: SubjectNote) => void;
  onCancelEdit: () => void;
  onSaveEdit: (n: SubjectNote) => void;
  onEditContentChange: (v: string) => void;
  onPin: (n: SubjectNote) => void;
  onDelete: (id: string) => void;
}

function NotesTab({
  category, notes, addingCategory, newContent, editingId, editContent,
  textareaRef, onStartAdd, onCancelAdd, onAdd, onNewContentChange,
  onStartEdit, onCancelEdit, onSaveEdit, onEditContentChange, onPin, onDelete,
}: NotesTabProps) {
  const meta = CATEGORY_META[category];
  const colorCls = COLOR_CLASSES[meta.color];
  const isAdding = addingCategory === category;

  const PLACEHOLDERS: Record<NoteCategory, string> = {
    general:   'Write a note about this subject...',
    teacher:   'e.g. Likes when you ask questions. Grades based on participation. Office hours: Tue 3-5pm...',
    tips:      'e.g. Always read chapter summaries. Focus on formulas from chapters 4-6...',
    resources: 'e.g. https://textbook.com/chapter1  or  "Study guide PDF – shared drive"',
  };

  const HEADERS: Record<NoteCategory, { title: string; subtitle: string }> = {
    general:   { title: 'General Notes',       subtitle: 'Anything relevant to this subject' },
    teacher:   { title: 'Teacher Profile',      subtitle: "Teaching style, preferences, what they value in exams" },
    tips:      { title: 'Exam Tips',            subtitle: 'Tips, strategies, and important topics for exams' },
    resources: { title: 'Resources & Links',    subtitle: 'Useful references, links, and materials' },
  };

  const header = HEADERS[category];

  return (
    <div>
      {/* Section header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{header.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{header.subtitle}</p>
        </div>
        {!isAdding && (
          <button
            onClick={onStartAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Plus size={14} />
            Add Note
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className={`rounded-xl border-2 ${colorCls.border} bg-white p-4 mb-4`}>
          <textarea
            ref={textareaRef}
            value={newContent}
            onChange={(e) => onNewContentChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onAdd();
              if (e.key === 'Escape') onCancelAdd();
            }}
            placeholder={PLACEHOLDERS[category]}
            rows={3}
            className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none resize-none mb-3"
          />
          <div className="flex items-center gap-2 justify-end">
            <button onClick={onCancelAdd} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Cancel
            </button>
            <button
              onClick={onAdd}
              disabled={!newContent.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              <Check size={13} />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 && !isAdding ? (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <div className={`w-10 h-10 ${colorCls.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
            <span className={colorCls.text}>{meta.icon}</span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">{header.title}</p>
          <p className="text-sm text-gray-400 mb-4">{header.subtitle}</p>
          <button
            onClick={onStartAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Plus size={14} />
            Add your first note
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              colorCls={colorCls}
              editingId={editingId}
              editContent={editContent}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onEditContentChange={onEditContentChange}
              onPin={onPin}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Note Card ───────────────────────────────────────────────────────────────

interface NoteCardProps {
  note: SubjectNote;
  colorCls: { bg: string; text: string; border: string };
  editingId: string | null;
  editContent: string;
  onStartEdit: (n: SubjectNote) => void;
  onCancelEdit: () => void;
  onSaveEdit: (n: SubjectNote) => void;
  onEditContentChange: (v: string) => void;
  onPin: (n: SubjectNote) => void;
  onDelete: (id: string) => void;
}

function NoteCard({
  note, colorCls, editingId, editContent,
  onStartEdit, onCancelEdit, onSaveEdit, onEditContentChange, onPin, onDelete,
}: NoteCardProps) {
  const isEditing = editingId === note.id;

  return (
    <div className={`bg-white rounded-xl border ${note.pinned ? colorCls.border : 'border-gray-200'} p-4 group`}>
      {note.pinned && (
        <div className={`inline-flex items-center gap-1 text-xs font-medium ${colorCls.text} mb-2`}>
          <Pin size={11} />
          Pinned
        </div>
      )}

      {isEditing ? (
        <>
          <textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSaveEdit(note);
              if (e.key === 'Escape') onCancelEdit();
            }}
            rows={3}
            className="w-full text-sm text-gray-800 outline-none resize-none mb-3"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button onClick={onCancelEdit} className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700">
              <X size={12} /> Cancel
            </button>
            <button
              onClick={() => onSaveEdit(note)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <Check size={12} /> Save
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-3">
          <p className="flex-1 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onPin(note)}
              title={note.pinned ? 'Unpin' : 'Pin'}
              className={`p-1.5 rounded-lg transition-colors ${note.pinned ? `${colorCls.bg} ${colorCls.text}` : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <Pin size={13} />
            </button>
            <button
              onClick={() => onStartEdit(note)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
}
