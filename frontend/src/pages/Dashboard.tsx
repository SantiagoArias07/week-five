import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, BookOpen, ClipboardList, TrendingUp,
  Plus, Calendar, AlertCircle, ArrowRight, Zap, MapPin,
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useSubjectStore } from '../store/useSubjectStore';
import { useExamStore } from '../store/useExamStore';
import { useAuthStore } from '../store/useAuthStore';
import { useT } from '../hooks/useT';
import { useUIStore } from '../store/useUIStore';
import type { TranslationKey } from '../i18n';

// ── helpers ──────────────────────────────────────────────────────────────────
function greeting(t: (k: TranslationKey) => string): string {
  const h = new Date().getHours();
  if (h < 12) return t('dash_morning');
  if (h < 18) return t('dash_afternoon');
  return t('dash_evening');
}

function formatShortDate(dateStr: string, lang: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' });
}

function daysUntil(dateStr: string): number {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

// ── stat card ─────────────────────────────────────────────────────────────────
interface StatProps {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; accent: string;
}
function Stat({ label, value, sub, icon: Icon, accent }: StatProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-0.5">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const { subjects } = useSubjectStore();
  const { exams } = useExamStore();
  const { user } = useAuthStore();
  const t = useT();

  const { language } = useUIStore();

  const firstName = user?.name.split(' ')[0] ?? 'Student';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── computed stats ────────────────────────────────────────────────────────
  const totalTasks    = tasks.length;
  const doneTasks     = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks  = tasks.filter((t) => t.status !== 'done').length;
  const highPriority  = tasks.filter((t) => t.status !== 'done' && t.priority === 'high').length;
  const overdueTasks  = tasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    return daysUntil(t.dueDate) < 0;
  }).length;

  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalCredits = subjects.reduce((s, sub) => s + (sub.credits ?? 0), 0);

  const weekExams = exams.filter((e) => {
    const d = daysUntil(e.date);
    return d >= 0 && d <= 7;
  }).length;

  // ── upcoming events (tasks + exams, next 7 days) ──────────────────────────
  const upcomingEvents = useMemo(() => {
    const list: Array<{ date: string; label: string; sub: string; kind: 'task' | 'exam'; color: string; daysLeft: number }> = [];

    tasks.forEach((task) => {
      if (task.status === 'done' || !task.dueDate) return;
      const d = daysUntil(task.dueDate);
      if (d >= 0 && d <= 7) {
        list.push({
          date: task.dueDate,
          label: task.title,
          sub: task.subject || '',
          kind: 'task',
          color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981',
          daysLeft: d,
        });
      }
    });

    exams.forEach((exam) => {
      if (!exam.date) return;
      const d = daysUntil(exam.date);
      if (d >= 0 && d <= 7) {
        list.push({
          date: exam.date,
          label: exam.title,
          sub: exam.subject,
          kind: 'exam',
          color: exam.subjectColor || '#6366f1',
          daysLeft: d,
        });
      }
    });

    return list.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 8);
  }, [tasks, exams]);

  // ── subject progress ──────────────────────────────────────────────────────
  const subjectProgress = useMemo(() => {
    return subjects.map((sub) => {
      const subTasks = tasks.filter((t) => t.subject === sub.name);
      const done = subTasks.filter((t) => t.status === 'done').length;
      const pct = subTasks.length > 0 ? Math.round((done / subTasks.length) * 100) : 0;
      return { ...sub, total: subTasks.length, done, pct };
    }).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [subjects, tasks]);

  // ── today's tasks ─────────────────────────────────────────────────────────
  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'done')
      .sort((a, b) => {
        const prioVal = { high: 0, medium: 1, low: 2 };
        return (prioVal[a.priority] ?? 1) - (prioVal[b.priority] ?? 1);
      })
      .slice(0, 4);
  }, [tasks]);

  const nextExam = useMemo(() => {
    const upcoming = exams.filter((e) => e.date && daysUntil(e.date) >= 0);
    if (!upcoming.length) return null;
    return [...upcoming].sort((a, b) => daysUntil(a.date) - daysUntil(b.date))[0];
  }, [exams]);

  const dateLabel = today.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  function daysLabel(d: number): string {
    if (d === 0) return t('common_today');
    if (d === 1) return t('common_tomorrow');
    return `${t('common_in_days')} ${d} ${t('common_days')}`;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-6 md:p-8">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 right-20 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-4 right-40 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">{dateLabel}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {greeting(t)}, {firstName} 👋
            </h1>
            <p className="text-indigo-200 mt-1.5 text-sm">
              {pendingTasks > 0
                ? <><span className="text-white font-semibold">{pendingTasks}</span> {t('dash_pending')}</>
                : t('dash_all_clear')}
              {weekExams > 0 && (
                <span className="ml-3">
                  · <span className="text-white font-semibold">{weekExams}</span>{' '}
                  {weekExams === 1 ? t('dash_exam_week') : t('dash_exams_week')}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/20 transition-all backdrop-blur-sm"
            >
              <Plus size={15} />
              {t('dash_add_task')}
            </button>
            <button
              onClick={() => navigate('/planner')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-700 text-sm font-medium rounded-xl hover:bg-indigo-50 transition-all"
            >
              <Calendar size={15} />
              {t('dash_view_planner')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label={t('dash_total_tasks')}
          value={totalTasks}
          sub={`${doneTasks} ${t('dash_done')} · ${pendingTasks} ${t('dash_remaining')}`}
          icon={CheckSquare}
          accent="bg-indigo-500"
        />
        <Stat
          label={t('dash_completed')}
          value={`${progressPercent}%`}
          sub={`${doneTasks} / ${totalTasks} ${t('common_tasks')}`}
          icon={TrendingUp}
          accent="bg-emerald-500"
        />
        <Stat
          label={t('dash_subjects')}
          value={subjects.length}
          sub={`${totalCredits} ${t('dash_credits')}`}
          icon={BookOpen}
          accent="bg-amber-500"
        />
        <Stat
          label={t('dash_upcoming_exams')}
          value={exams.length}
          sub={weekExams > 0 ? `${weekExams} ${t('dash_this_week')}` : t('dash_no_events')}
          icon={ClipboardList}
          accent="bg-rose-500"
        />
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('dash_progress')}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {doneTasks} {t('dash_done')} · {pendingTasks} {t('dash_remaining')}
              {overdueTasks > 0 && (
                <span className="text-red-500 ml-2">· {overdueTasks} {t('dash_overdue')}</span>
              )}
            </p>
          </div>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* milestone markers */}
        <div className="flex justify-between mt-2">
          {[25, 50, 75, 100].map((m) => (
            <span
              key={m}
              className={`text-xs font-medium transition-colors ${
                progressPercent >= m ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              {m}%
            </span>
          ))}
        </div>
      </div>

      {/* ── Main two-column grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left column (wider) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{t('dash_upcoming_events')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('dash_next_7')}</p>
              </div>
              <button
                onClick={() => navigate('/planner')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                {t('nav_planner')} <ArrowRight size={12} />
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Zap size={28} className="text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">{t('dash_no_events')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => navigate(ev.kind === 'exam' ? '/exams' : '/tasks')}
                  >
                    <div
                      className="w-1 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ev.color }}
                    />
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${ev.color}20` }}
                    >
                      {ev.kind === 'exam'
                        ? <ClipboardList size={16} style={{ color: ev.color }} />
                        : <CheckSquare size={16} style={{ color: ev.color }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{ev.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{ev.sub}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {formatShortDate(ev.date, language)}
                      </p>
                      <p className={`text-xs mt-0.5 font-medium ${
                        ev.daysLeft === 0 ? 'text-red-500' :
                        ev.daysLeft === 1 ? 'text-amber-500' :
                        'text-gray-400 dark:text-gray-500'
                      }`}>
                        {daysLabel(ev.daysLeft)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{t('dash_subject_progress')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('dash_task_breakdown')}</p>
              </div>
              <button
                onClick={() => navigate('/subjects')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                {t('nav_subjects')} <ArrowRight size={12} />
              </button>
            </div>
            {subjectProgress.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('dash_no_events')}</p>
            ) : (
              <div className="space-y-3.5">
                {subjectProgress.map((sub) => (
                  <div key={sub.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{sub.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                        {sub.done}/{sub.total}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${sub.pct}%`, backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Next Exam Countdown */}
          <div
            className="rounded-2xl border border-gray-100 dark:border-gray-700 p-5 overflow-hidden"
            style={nextExam ? { borderColor: `${nextExam.subjectColor}40` } : undefined}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('dash_next_exam')}</h2>
              <button
                onClick={() => navigate('/exams')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                {t('nav_exams')} <ArrowRight size={12} />
              </button>
            </div>

            {!nextExam ? (
              <div className="text-center py-4">
                <ClipboardList size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">{t('dash_no_exams_yet')}</p>
              </div>
            ) : (() => {
              const days = daysUntil(nextExam.date);
              return (
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
                      style={{ backgroundColor: `${nextExam.subjectColor}20`, color: nextExam.subjectColor }}
                    >
                      {nextExam.subject}
                    </span>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">{nextExam.title}</p>
                    {nextExam.room && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
                        <MapPin size={11} /> {nextExam.room}
                      </p>
                    )}
                    {nextExam.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {nextExam.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${nextExam.subjectColor}18`, color: nextExam.subjectColor }}
                          >
                            {topic}
                          </span>
                        ))}
                        {nextExam.topics.length > 3 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">+{nextExam.topics.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-xl flex flex-col items-center justify-center"
                      style={{ backgroundColor: `${nextExam.subjectColor}18` }}
                    >
                      <span className="text-2xl font-bold leading-none" style={{ color: nextExam.subjectColor }}>
                        {days === 0 ? '!' : days}
                      </span>
                      <span className="text-[10px] font-medium mt-0.5 leading-tight text-center px-1" style={{ color: nextExam.subjectColor }}>
                        {days === 0 ? t('dash_exam_today') : t('dash_days_left')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right column (narrower) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's Focus */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('dash_todays_focus')}</h2>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                {t('nav_tasks')} <ArrowRight size={12} />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">{t('dash_all_clear')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/tasks')}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-amber-400' :
                      'bg-emerald-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{task.title}</p>
                      {task.subject && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{task.subject}</p>
                      )}
                    </div>
                    {task.dueDate && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {formatShortDate(task.dueDate, language)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dash_quick_stats')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertCircle size={14} className="text-red-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('dash_high_priority')}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{highPriority}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <CheckSquare size={14} className="text-amber-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('dash_overdue')}</span>
                </div>
                <span className={`text-sm font-bold ${overdueTasks > 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                  {overdueTasks}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <Calendar size={14} className="text-indigo-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('dash_this_week')}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {weekExams} {weekExams === 1 ? t('common_exam') : t('dash_upcoming_exams')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <TrendingUp size={14} className="text-emerald-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('dash_completed')}</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800/40 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">{t('dash_quick_actions')}</h2>
            <div className="space-y-2">
              {[
                { label: t('nav_tasks'), path: '/tasks', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40' },
                { label: t('nav_planner'), path: '/planner', color: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40' },
                { label: t('nav_exams'), path: '/exams', color: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40' },
                { label: t('nav_study'), path: '/study', color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-sm ${item.color}`}
                >
                  {item.label}
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
