import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, X, Check,
  CheckSquare, ClipboardList, Calendar,
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useExamStore } from '../store/useExamStore';
import { usePlannerStore } from '../store/usePlannerStore';
import { useT } from '../hooks/useT';
import type { PlannerEvent, Task, Exam } from '../types';

// ── date helpers ──────────────────────────────────────────────────────────────
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function sameDate(a: Date, b: Date): boolean {
  return isoDate(a) === isoDate(b);
}

function formatMonthYear(d: Date, lang: string): string {
  return d.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { month: 'long', year: 'numeric' });
}

// ── hours range ───────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am–9pm

function hourLabel(h: number): string {
  if (h === 12) return '12 PM';
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}

// ── preset colors ─────────────────────────────────────────────────────────────
const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6'];

// ── Event Modal ───────────────────────────────────────────────────────────────
interface ModalProps {
  initial?: PlannerEvent | null;
  defaultDate?: string;
  onSave: (e: Omit<PlannerEvent, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function EventModal({ initial, defaultDate, onSave, onDelete, onClose }: ModalProps) {
  const t = useT();
  const todayStr = isoDate(new Date());
  const [title, setTitle]       = useState(initial?.title ?? '');
  const [date, setDate]         = useState(initial?.date || defaultDate || todayStr);
  const [hour, setHour]         = useState(initial?.hour ?? 9);
  const [duration, setDuration] = useState(initial?.duration ?? 1);
  const [color, setColor]       = useState(initial?.color ?? '#6366f1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave({ title: title.trim(), date, hour, duration, color });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {initial ? t('planner_edit_event') : t('planner_new_event')}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('planner_event_title')}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Web Dev Lecture"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:text-white dark:placeholder:text-gray-500 transition"
            />
          </div>

          {/* Date + Hour */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('common_today').replace('Hoy','Fecha').replace('Today','Date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('planner_start_time')}</label>
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{hourLabel(h)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('planner_duration')} — {duration} {duration === 1 ? t('planner_hour') : t('planner_hours')}
            </label>
            <input
              type="range" min={1} max={4} step={0.5} value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{t('planner_color')}</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? 'rgba(0,0,0,0.4)' : 'transparent',
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Check size={14} />
              {t('planner_save')}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 rounded-xl transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('planner_cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Day Detail Panel (monthly view) ──────────────────────────────────────────
interface DayPanelProps {
  date: Date;
  tasks: Task[];
  exams: Exam[];
  events: PlannerEvent[];
  onClose: () => void;
}

function DayPanel({ date, tasks, exams, events, onClose }: DayPanelProps) {
  const t = useT();
  const iso = isoDate(date);
  const dayTasks  = tasks.filter((ta) => ta.dueDate === iso && ta.status !== 'done');
  const dayExams  = exams.filter((e)  => e.date === iso);
  const dayEvents = events.filter((e) => e.date === iso).sort((a, b) => a.hour - b.hour);
  const empty = dayTasks.length + dayExams.length + dayEvents.length === 0;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <X size={14} />
        </button>
      </div>
      <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
        {empty && <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center">{t('planner_no_events_day')}</p>}
        {dayEvents.map((ev) => (
          <div key={ev.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: `${ev.color}15` }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ev.color }} />
            <span className="text-xs font-medium truncate" style={{ color: ev.color }}>{ev.title}</span>
            <span className="text-xs text-gray-400 ml-auto">{hourLabel(ev.hour)}</span>
          </div>
        ))}
        {dayTasks.map((ta) => (
          <div key={ta.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
            <CheckSquare size={12} className="text-indigo-500 flex-shrink-0" />
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 truncate">{ta.title}</span>
          </div>
        ))}
        {dayExams.map((ex) => (
          <div key={ex.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20">
            <ClipboardList size={12} className="text-rose-500 flex-shrink-0" />
            <span className="text-xs font-medium text-rose-700 dark:text-rose-300 truncate">{ex.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main Planner ──────────────────────────────────────────────────────────────
export default function Planner() {
  const t = useT();
  const { tasks } = useTaskStore();
  const { exams } = useExamStore();
  const { events, addEvent, updateEvent, deleteEvent } = usePlannerStore();

  const isEs = t('nav_home') === 'Inicio';

  const [view, setView] = useState<'week' | 'month'>('week');
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [monthDate, setMonthDate] = useState<Date>(() => {
    const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d;
  });
  const [modal, setModal] = useState<{ open: boolean; event?: PlannerEvent | null; defaultDate?: string }>({ open: false });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const today = new Date(); today.setHours(0,0,0,0);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const SHORT_DAYS = isEs
    ? ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // ── month grid ────────────────────────────────────────────────────────────
  const monthGrid = useMemo(() => {
    const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const lastDay  = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7;
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthDate]);

  function countForDay(date: Date) {
    const iso = isoDate(date);
    return {
      tasks:  tasks.filter((ta) => ta.dueDate === iso && ta.status !== 'done').length,
      exams:  exams.filter((ex) => ex.date === iso).length,
      events: events.filter((ev) => ev.date === iso).length,
    };
  }

  // ── save / delete ─────────────────────────────────────────────────────────
  const handleSave = async (data: Omit<PlannerEvent, 'id'>) => {
    if (modal.event) {
      await updateEvent(modal.event.id, data);
    } else {
      await addEvent(data);
    }
    setModal({ open: false });
  };

  const handleDelete = async () => {
    if (modal.event) {
      await deleteEvent(modal.event.id);
      setModal({ open: false });
    }
  };

  // ── open modal with optional pre-filled date ──────────────────────────────
  const openNew = (defaultDate?: string) => {
    setModal({ open: true, event: null, defaultDate });
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('planner_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">{t('planner_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {t('planner_week')}
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {t('planner_month')}
            </button>
          </div>
          <button
            onClick={() => openNew(isoDate(today))}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus size={15} />
            {t('planner_add_event')}
          </button>
        </div>
      </div>

      {/* Navigation row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => view === 'week'
              ? setWeekStart(addDays(weekStart, -7))
              : setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))
            }
            className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 px-2 min-w-[180px] text-center">
            {view === 'week'
              ? `${weekDays[0].toLocaleDateString(isEs ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(isEs ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : formatMonthYear(monthDate, isEs ? 'es' : 'en')
            }
          </h2>

          <button
            onClick={() => view === 'week'
              ? setWeekStart(addDays(weekStart, 7))
              : setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))
            }
            className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => {
            if (view === 'week') setWeekStart(getMonday(new Date()));
            else setMonthDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
          }}
          className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          {t('planner_today')}
        </button>
      </div>

      {/* ── WEEKLY VIEW ──────────────────────────────────────────────────────── */}
      {view === 'week' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Day headers */}
          <div className="grid border-b border-gray-200 dark:border-gray-700" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
            <div className="h-14 border-r border-gray-100 dark:border-gray-700" />
            {weekDays.map((day, i) => {
              const isToday = sameDate(day, today);
              return (
                <div
                  key={i}
                  className={`h-14 flex flex-col items-center justify-center border-r border-gray-100 dark:border-gray-700 last:border-0 ${
                    isToday ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">{SHORT_DAYS[i]}</p>
                  <div className={`text-sm font-bold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All-day row: tasks + exams */}
          <div className="grid border-b border-gray-200 dark:border-gray-700 min-h-[40px]" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
            <div className="border-r border-gray-100 dark:border-gray-700 flex items-center justify-center">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-tight text-center px-1">
                {t('planner_all_day')}
              </span>
            </div>
            {weekDays.map((day, i) => {
              const iso = isoDate(day);
              const isToday = sameDate(day, today);
              const dayTasks = tasks.filter((ta) => ta.dueDate === iso && ta.status !== 'done');
              const dayExams = exams.filter((e) => e.date === iso);
              return (
                <div
                  key={i}
                  className={`border-r border-gray-100 dark:border-gray-700 last:border-0 p-1 space-y-0.5 ${
                    isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                  }`}
                >
                  {dayExams.map((ex) => (
                    <div
                      key={ex.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white truncate"
                      style={{ backgroundColor: ex.subjectColor || '#6366f1' }}
                      title={ex.title}
                    >
                      📋 {ex.title}
                    </div>
                  ))}
                  {dayTasks.map((ta) => (
                    <div
                      key={ta.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate"
                      style={{
                        backgroundColor: ta.priority === 'high' ? '#fef2f2' : ta.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                        color: ta.priority === 'high' ? '#ef4444' : ta.priority === 'medium' ? '#d97706' : '#16a34a',
                      }}
                      title={ta.title}
                    >
                      ✓ {ta.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                style={{ gridTemplateColumns: '64px repeat(7, 1fr)', minHeight: '52px' }}
              >
                <div className="px-2 pt-2 border-r border-gray-100 dark:border-gray-700 flex-shrink-0">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{hourLabel(hour)}</span>
                </div>
                {weekDays.map((day, dayIdx) => {
                  const isToday = sameDate(day, today);
                  const iso = isoDate(day);
                  const cellEvents = events.filter((e) => e.date === iso && e.hour === hour);
                  return (
                    <div
                      key={dayIdx}
                      onClick={() => cellEvents.length === 0 && openNew(iso)}
                      className={`border-r border-gray-100 dark:border-gray-700 last:border-0 p-1 relative transition-colors cursor-pointer ${
                        isToday
                          ? 'bg-indigo-50/20 dark:bg-indigo-900/10 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20'
                          : 'hover:bg-gray-50/70 dark:hover:bg-gray-700/20'
                      }`}
                    >
                      {cellEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => { e.stopPropagation(); setModal({ open: true, event: ev }); }}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-white cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                          style={{
                            backgroundColor: ev.color,
                            minHeight: `${ev.duration * 48}px`,
                          }}
                          title={`${ev.title} (${ev.duration}h)`}
                        >
                          <p className="truncate leading-tight">{ev.title}</p>
                          <p className="opacity-75 text-[10px]">{ev.duration}h</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-6 border-t border-gray-100 dark:border-gray-700">
              <Calendar size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('planner_no_classes')}</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                {isEs ? 'Haz clic en una celda o usa el botón de arriba.' : 'Click a cell or use the button above.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── MONTHLY VIEW ─────────────────────────────────────────────────────── */}
      {view === 'month' && (
        <div className="relative">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {SHORT_DAYS.map((d) => (
                <div key={d} className="h-10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{d}</span>
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {monthGrid.map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} className="min-h-[80px] border-r border-b border-gray-100 dark:border-gray-700/50 last:border-r-0 bg-gray-50/50 dark:bg-gray-900/20" />;
                }

                const isToday = sameDate(day, today);
                const isSelected = selectedDay ? sameDate(day, selectedDay) : false;
                const counts = countForDay(day);
                const hasItems = counts.tasks + counts.exams + counts.events > 0;

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`min-h-[80px] border-r border-b border-gray-100 dark:border-gray-700/50 last:border-r-0 p-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                      isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {day.getDate()}
                    </div>
                    {hasItems && (
                      <div className="space-y-0.5">
                        {counts.events > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {counts.events} {isEs ? (counts.events > 1 ? 'eventos' : 'evento') : (counts.events > 1 ? 'events' : 'event')}
                            </span>
                          </div>
                        )}
                        {counts.tasks > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {counts.tasks} {isEs ? (counts.tasks > 1 ? 'tareas' : 'tarea') : (counts.tasks > 1 ? 'tasks' : 'task')}
                            </span>
                          </div>
                        )}
                        {counts.exams > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {counts.exams} {isEs ? (counts.exams > 1 ? 'exámenes' : 'examen') : (counts.exams > 1 ? 'exams' : 'exam')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day detail panel */}
          {selectedDay && (
            <div className="absolute top-0 right-0 z-10 mt-1">
              <DayPanel
                date={selectedDay}
                tasks={tasks}
                exams={exams}
                events={events}
                onClose={() => setSelectedDay(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <EventModal
          initial={modal.event}
          defaultDate={modal.defaultDate}
          onSave={handleSave}
          onDelete={modal.event ? handleDelete : undefined}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
