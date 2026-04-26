import { Plus, ClipboardList, X, Check, BookOpen } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useExamStore } from '../store/useExamStore';
import { useSubjectStore } from '../store/useSubjectStore';
import { usePlannerStore } from '../store/usePlannerStore';
import ExamCard from '../components/ExamCard';
import { useT } from '../hooks/useT';
import type { Exam } from '../types';

const emptyForm = {
  title: '',
  subject: '',
  subjectColor: '#6366f1',
  date: '',
  topics: '',
  room: '',
  weightPct: 0,
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function priorityScore(exam: Exam): number {
  const d = Math.max(1, daysUntil(exam.date));
  return (exam.weightPct ?? 0) * (100 / d);
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 .. 22

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${ampm}`;
}

export default function Exams() {
  const { exams, isLoading, addExam } = useExamStore();
  const subjects = useSubjectStore((s) => s.subjects);
  const addEvent = usePlannerStore((s) => s.addEvent);
  const t = useT();

  // ── Add exam modal ──────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // ── Study plan modal ────────────────────────────────────────────────────────
  const [planExam, setPlanExam] = useState<Exam | null>(null);
  const [planDays, setPlanDays] = useState(5);
  const [planHour, setPlanHour] = useState(18);
  const [planCreating, setPlanCreating] = useState(false);
  const [planSuccess, setPlanSuccess] = useState(false);

  // ── Sort exams by priority score, then date ────────────────────────────────
  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => {
      const da = daysUntil(a.date);
      const db = daysUntil(b.date);
      if (da < 0 && db >= 0) return 1;
      if (db < 0 && da >= 0) return -1;
      const pa = priorityScore(a);
      const pb = priorityScore(b);
      if (Math.abs(pb - pa) > 0.1) return pb - pa;
      return da - db;
    });
  }, [exams]);

  const upcoming = sortedExams.filter((e) => { const d = daysUntil(e.date); return d >= 0 && d <= 7; });
  const later    = sortedExams.filter((e) => daysUntil(e.date) > 7);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSubjectChange = (name: string) => {
    const found = subjects.find((s) => s.name === name);
    setForm((p) => ({ ...p, subject: name, subjectColor: found?.color ?? '#6366f1' }));
  };

  const openModal = () => {
    const init = { ...emptyForm };
    if (subjects.length > 0) {
      init.subject = subjects[0].name;
      init.subjectColor = subjects[0].color;
    }
    setForm(init);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim() || !form.date) return;
    setSaving(true);
    try {
      const topicsArray = form.topics
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await addExam({
        title: form.title.trim(),
        subject: form.subject.trim(),
        subjectColor: form.subjectColor,
        date: form.date,
        topics: topicsArray,
        room: form.room.trim(),
        weightPct: form.weightPct,
      });
      setForm({ ...emptyForm });
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!planExam) return;
    setPlanCreating(true);
    try {
      const examDate = new Date(planExam.date + 'T12:00:00');
      for (let i = planDays; i >= 1; i--) {
        const d = new Date(examDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        await addEvent({
          title: `${t('exams_study_plan')}: ${planExam.title}`,
          date: dateStr,
          hour: planHour,
          duration: 1,
          color: planExam.subjectColor,
        });
      }
      setPlanSuccess(true);
      setTimeout(() => {
        setPlanSuccess(false);
        setPlanExam(null);
      }, 2000);
    } finally {
      setPlanCreating(false);
    }
  };

  const planPreviewDates = useMemo(() => {
    if (!planExam) return [];
    const examDate = new Date(planExam.date + 'T12:00:00');
    return Array.from({ length: planDays }, (_, i) => {
      const d = new Date(examDate);
      d.setDate(d.getDate() - (planDays - i));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  }, [planExam, planDays]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('exams_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {exams.length} {t('exams_scheduled')}
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          {t('exams_add')}
        </button>
      </div>

      {/* Alert */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <ClipboardList size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">{t('exams_heads_up')}</span>{' '}
            {upcoming.length}{' '}
            {upcoming.length === 1 ? t('common_exam').toLowerCase() : t('nav_exams').toLowerCase()}{' '}
            {t('exams_alert_body')}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-40 animate-pulse">
              <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t('exams_next_up')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcoming.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} onStudyPlan={setPlanExam} />
                ))}
              </div>
            </section>
          )}

          {later.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t('exams_later')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {later.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} onStudyPlan={setPlanExam} />
                ))}
              </div>
            </section>
          )}

          {exams.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500 mb-4">{t('exams_no_exams')}</p>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus size={15} />
                {t('exams_add')}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Add Exam Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('exams_add')}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('exams_title_input')} <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Final Exam, Midterm..."
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:text-white dark:placeholder:text-gray-500 transition-all"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('exams_subject_label')} <span className="text-red-500">*</span>
                </label>
                {subjects.length > 0 ? (
                  <select
                    value={form.subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all cursor-pointer"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="Subject name"
                    required
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white dark:placeholder:text-gray-500 transition-all"
                  />
                )}
              </div>

              {/* Date + Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('exams_date_label')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('exams_room')}
                  </label>
                  <input
                    value={form.room}
                    onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
                    placeholder="Room 301"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white dark:placeholder:text-gray-500 transition-all"
                  />
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('exams_weight_label')}
                  <span className="ml-1 font-bold text-indigo-600 dark:text-indigo-400">{form.weightPct}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.weightPct}
                  onChange={(e) => setForm((p) => ({ ...p, weightPct: Number(e.target.value) }))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('exams_topics')}
                </label>
                <input
                  value={form.topics}
                  onChange={(e) => setForm((p) => ({ ...p, topics: e.target.value }))}
                  placeholder={t('exams_topics_hint')}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white dark:placeholder:text-gray-500 transition-all"
                />
                {form.topics.trim() && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.topics.split(',').map((s) => s.trim()).filter(Boolean).map((topic, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${form.subjectColor}20`,
                          color: form.subjectColor,
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  {t('settings_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.title.trim() || !form.subject.trim() || !form.date}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-all"
                >
                  {saving ? t('settings_saving') : t('exams_add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Study Plan Modal ────────────────────────────────────────────────── */}
      {planExam && !planSuccess && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setPlanExam(null)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t('exams_study_plan_title')}
                </h2>
              </div>
              <button
                onClick={() => setPlanExam(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Selected exam */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1.5"
                  style={{ backgroundColor: `${planExam.subjectColor}20`, color: planExam.subjectColor }}
                >
                  {planExam.subject}
                </span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{planExam.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{planExam.date}</p>
              </div>

              {/* Days slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('exams_study_plan_days')}:{' '}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{planDays}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={14}
                  value={planDays}
                  onChange={(e) => setPlanDays(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>14</span>
                </div>
              </div>

              {/* Hour select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('exams_study_plan_hour')}
                </label>
                <select
                  value={planHour}
                  onChange={(e) => setPlanHour(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white cursor-pointer"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{formatHour(h)}</option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-3">
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-2">
                  {planDays} {t('exams_study_plan_sessions_label')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {planPreviewDates.slice(0, 8).map((date, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800/40"
                    >
                      {date}
                    </span>
                  ))}
                  {planPreviewDates.length > 8 && (
                    <span className="text-xs text-indigo-500">+{planPreviewDates.length - 8}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPlanExam(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  {t('settings_cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleCreatePlan}
                  disabled={planCreating}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-all"
                >
                  {planCreating ? t('settings_saving') : t('exams_study_plan_create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Success toast ───────────────────────────────────────────────────── */}
      {planSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
          <Check size={16} />
          {t('exams_study_plan_success')}
        </div>
      )}
    </div>
  );
}
