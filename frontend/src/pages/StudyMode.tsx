import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, BarChart2 } from 'lucide-react';
import { useT } from '../hooks/useT';
import { useUIStore } from '../store/useUIStore';
import { useStudySessionStore } from '../store/useStudySessionStore';
import { useSubjectStore } from '../store/useSubjectStore';

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export default function StudyMode() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const t = useT();
  const { language } = useUIStore();
  const subjects = useSubjectStore((s) => s.subjects);
  const { weeklyData, loadWeekly, addSession } = useStudySessionStore();

  const addSessionRef = useRef(addSession);
  addSessionRef.current = addSession;
  const selectedSubjectRef = useRef(selectedSubject);
  selectedSubjectRef.current = selectedSubject;

  useEffect(() => { loadWeekly(); }, []);

  const duration = isBreak ? BREAK_DURATION : FOCUS_DURATION;
  const progress = ((duration - timeLeft) / duration) * 100;
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsRunning(false);
          if (!isBreak) {
            setSessions((s) => s + 1);
            addSessionRef.current(selectedSubjectRef.current, Math.round(FOCUS_DURATION / 60));
          }
          const nextBreak = !isBreak;
          setIsBreak(nextBreak);
          return nextBreak ? BREAK_DURATION : FOCUS_DURATION;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_DURATION : FOCUS_DURATION);
  }, [isBreak]);

  const switchMode = (toBreak: boolean) => {
    setIsRunning(false);
    setIsBreak(toBreak);
    setTimeLeft(toBreak ? BREAK_DURATION : FOCUS_DURATION);
  };

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const ss = (timeLeft % 60).toString().padStart(2, '0');
  const accentColor = isBreak ? '#10b981' : '#6366f1';

  // ── Weekly chart data ──────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const date = d.toISOString().split('T')[0];
      const found = weeklyData.find((w) => w.date === date);
      const label = d.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { weekday: 'short' });
      return { date, label, totalMinutes: found?.totalMinutes ?? 0, sessions: found?.sessions ?? 0 };
    });
  }, [weeklyData, language]);

  const maxMinutes = Math.max(...chartData.map((d) => d.totalMinutes), 60);
  const todayStr = new Date().toISOString().split('T')[0];
  const weekTotal = chartData.reduce((s, d) => s + d.totalMinutes, 0);
  const weekSessions = chartData.reduce((s, d) => s + d.sessions, 0);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('study_title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">{t('study_subtitle')}</p>
      </div>

      {/* Subject selector */}
      <div className="flex items-center justify-center mb-6">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="">— {t('study_subject_select')} —</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-fit mx-auto mb-10">
        <button
          onClick={() => switchMode(false)}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            !isBreak
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Brain size={15} />{t('study_focus')}
        </button>
        <button
          onClick={() => switchMode(true)}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            isBreak
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Coffee size={15} />{t('study_break')}
        </button>
      </div>

      {/* Timer ring */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative">
          <svg width={200} height={200} className="-rotate-90">
            <circle cx={100} cy={100} r={radius} fill="none" stroke="currentColor"
              className="text-gray-100 dark:text-gray-700" strokeWidth={10} />
            <circle cx={100} cy={100} r={radius} fill="none" stroke={accentColor}
              strokeWidth={10} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">{mm}:{ss}</span>
            <span className="text-xs font-semibold mt-1 uppercase tracking-widest" style={{ color: accentColor }}>
              {isBreak ? t('study_break') : t('study_focus')}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <button
          onClick={reset}
          className="p-3 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setIsRunning((r) => !r)}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${
            isBreak
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-emerald-900/50'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-indigo-900/50'
          }`}
        >
          {isRunning ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
        <div className="w-11 h-11" />
      </div>

      {/* Session counter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('study_sessions_today')}</h3>
          <span className="text-2xl font-bold" style={{ color: accentColor }}>{sessions}</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${i >= sessions ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              style={i < sessions ? { backgroundColor: accentColor } : undefined}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
          <span>{sessions} / 8 {t('study_sessions_label')}</span>
          <span>{sessions * 25} {t('study_min_focused')}</span>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-500" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('study_weekly_title')}</h3>
          </div>
          <div className="text-right text-xs text-gray-400 dark:text-gray-500">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{weekTotal}</span> {t('study_total_minutes')}
            <span className="mx-1">·</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{weekSessions}</span> {t('study_total_sessions')}
          </div>
        </div>
        <div className="flex items-end gap-1.5" style={{ height: 100 }}>
          {chartData.map((day) => {
            const isToday = day.date === todayStr;
            const barH = day.totalMinutes > 0
              ? Math.max(4, Math.round((day.totalMinutes / maxMinutes) * 72))
              : 0;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 flex items-end w-full justify-center">
                  <div
                    className="w-full max-w-[28px] rounded-t-md transition-all duration-500"
                    style={{
                      height: barH > 0 ? barH : 2,
                      backgroundColor: barH > 0
                        ? (isToday ? accentColor : `${accentColor}70`)
                        : (document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6'),
                    }}
                  />
                </div>
                <span className={`text-[10px] font-medium ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {day.label}
                </span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 min-h-[12px]">
                  {day.totalMinutes > 0 ? `${day.totalMinutes}m` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {isBreak ? t('study_tip_break') : t('study_tip_focus')}
        </p>
      </div>
    </div>
  );
}
