import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { useT } from '../hooks/useT';

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export default function StudyMode() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const t = useT();

  const duration = isBreak ? BREAK_DURATION : FOCUS_DURATION;
  const progress = ((duration - timeLeft) / duration) * 100;

  // SVG ring
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsRunning(false);
          if (!isBreak) setSessions((s) => s + 1);
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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('study_title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">{t('study_subtitle')}</p>
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
          <Brain size={15} />
          {t('study_focus')}
        </button>
        <button
          onClick={() => switchMode(true)}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            isBreak
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Coffee size={15} />
          {t('study_break')}
        </button>
      </div>

      {/* Timer ring */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative">
          <svg width={200} height={200} className="-rotate-90">
            {/* Background track */}
            <circle
              cx={100}
              cy={100}
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-gray-100 dark:text-gray-700"
              strokeWidth={10}
            />
            {/* Progress */}
            <circle
              cx={100}
              cy={100}
              r={radius}
              fill="none"
              stroke={accentColor}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
              {mm}:{ss}
            </span>
            <span
              className="text-xs font-semibold mt-1 uppercase tracking-widest"
              style={{ color: accentColor }}
            >
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
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

      {/* Tips */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {isBreak ? t('study_tip_break') : t('study_tip_focus')}
        </p>
      </div>
    </div>
  );
}
