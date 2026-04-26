import { useMemo, useState } from 'react';
import { Trophy, Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useGradeStore } from '../store/useGradeStore';
import { useSubjectStore } from '../store/useSubjectStore';
import { useT } from '../hooks/useT';
import { Grade } from '../types';

// ── helpers ──────────────────────────────────────────────────────────────────

function pctScore(g: Grade) {
  return g.maxScore > 0 ? (g.score / g.maxScore) * 100 : 0;
}

function letterGrade(p: number): string {
  if (p >= 97) return 'A+';
  if (p >= 93) return 'A';
  if (p >= 90) return 'A-';
  if (p >= 87) return 'B+';
  if (p >= 83) return 'B';
  if (p >= 80) return 'B-';
  if (p >= 77) return 'C+';
  if (p >= 73) return 'C';
  if (p >= 70) return 'C-';
  if (p >= 67) return 'D+';
  if (p >= 63) return 'D';
  if (p >= 60) return 'D-';
  return 'F';
}

function gradeTextColor(p: number) {
  if (p >= 90) return 'text-emerald-500';
  if (p >= 80) return 'text-blue-500';
  if (p >= 70) return 'text-amber-500';
  if (p >= 60) return 'text-orange-500';
  return 'text-red-500';
}

function gradeBg(p: number) {
  if (p >= 90) return 'bg-emerald-50 dark:bg-emerald-900/20';
  if (p >= 80) return 'bg-blue-50 dark:bg-blue-900/20';
  if (p >= 70) return 'bg-amber-50 dark:bg-amber-900/20';
  if (p >= 60) return 'bg-orange-50 dark:bg-orange-900/20';
  return 'bg-red-50 dark:bg-red-900/20';
}

function calcSubjectAvg(grades: Grade[]): number {
  if (!grades.length) return 0;
  const totalWeight = grades.reduce((s, g) => s + g.weightPct, 0);
  if (totalWeight > 0)
    return grades.reduce((s, g) => s + pctScore(g) * g.weightPct, 0) / totalWeight;
  return grades.reduce((s, g) => s + pctScore(g), 0) / grades.length;
}

const TYPE_LABELS: Record<Grade['type'], string> = {
  exam: 'Exam', quiz: 'Quiz', homework: 'HW', project: 'Proj.', other: 'Other',
};

const emptyForm = {
  subject: '', title: '', score: '', maxScore: '100',
  weightPct: '0', type: 'exam' as Grade['type'], date: '', notes: '',
};

// ── component ─────────────────────────────────────────────────────────────────

export default function Grades() {
  const { grades, isLoading, addGrade, deleteGrade } = useGradeStore();
  const subjects = useSubjectStore((s) => s.subjects);
  const t = useT();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const gradesBySubject = useMemo(() => {
    const map = new Map<string, Grade[]>();
    grades.forEach((g) => {
      if (!map.has(g.subject)) map.set(g.subject, []);
      map.get(g.subject)!.push(g);
    });
    return map;
  }, [grades]);

  const subjectAverages = useMemo(() => {
    const map = new Map<string, number>();
    gradesBySubject.forEach((gs, subj) => map.set(subj, calcSubjectAvg(gs)));
    return map;
  }, [gradesBySubject]);

  const overallGPA = useMemo(() => {
    let totalCredits = 0, weightedSum = 0;
    subjectAverages.forEach((avg, subName) => {
      const credits = subjects.find((s) => s.name === subName)?.credits ?? 3;
      weightedSum += avg * credits;
      totalCredits += credits;
    });
    return totalCredits > 0 ? weightedSum / totalCredits : 0;
  }, [subjectAverages, subjects]);

  const bestSubject = useMemo((): { name: string; avg: number } | null => {
    const entries = Array.from(subjectAverages.entries());
    if (!entries.length) return null;
    return entries.reduce<{ name: string; avg: number } | null>((acc, [name, avg]) =>
      acc === null || avg > acc.avg ? { name, avg } : acc, null);
  }, [subjectAverages]);

  const scorePreview =
    form.score !== '' && Number(form.maxScore) > 0
      ? (Number(form.score) / Number(form.maxScore)) * 100
      : null;

  const openModal = () => {
    setForm({
      ...emptyForm,
      subject: subjects[0]?.name ?? '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const score = Number(form.score);
    if (!form.subject || !form.title.trim() || isNaN(score)) return;
    setSaving(true);
    try {
      await addGrade({
        subject: form.subject, title: form.title.trim(),
        score, maxScore: Number(form.maxScore) || 100,
        weightPct: Number(form.weightPct) || 0,
        type: form.type, date: form.date, notes: form.notes,
      });
      setExpanded((prev) => new Set([...prev, form.subject]));
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleExpanded = (subj: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(subj) ? next.delete(subj) : next.add(subj);
      return next;
    });

  const allSubjects = [...gradesBySubject.keys()].sort();

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
        <div className="h-36 bg-gray-100 dark:bg-gray-700 rounded-2xl mb-6 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy size={22} className="text-amber-500" />
            {t('grades_title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">{t('grades_subtitle')}</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          {t('grades_add')}
        </button>
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-amber-500" />
          </div>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('grades_no_grades')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">{t('grades_no_grades_sub')}</p>
          <button onClick={openModal} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
            <Plus size={15} />{t('grades_add')}
          </button>
        </div>
      ) : (
        <>
          {/* GPA Hero */}
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <div className={`absolute inset-0 ${
              overallGPA >= 90 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
              overallGPA >= 70 ? 'bg-gradient-to-br from-indigo-600 to-violet-700' :
              'bg-gradient-to-br from-amber-500 to-orange-600'
            }`} />
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-6 right-16 w-24 h-24 rounded-full bg-white/5" />
            <div className="relative flex items-center justify-between p-6 md:p-8">
              <div>
                <p className="text-white/70 text-sm font-medium">{t('grades_gpa')}</p>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-4xl font-bold text-white">{overallGPA.toFixed(1)}%</span>
                  <span className="text-2xl font-semibold text-white/80 mb-0.5">
                    {overallGPA > 0 ? letterGrade(overallGPA) : '—'}
                  </span>
                </div>
                <p className="text-white/60 text-xs mt-1">
                  {gradesBySubject.size} {t('grades_subjects_tracked')} · {grades.length} {t('grades_total').toLowerCase()}
                </p>
              </div>
              {bestSubject && (
                <div className="text-right bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white/60 text-xs mb-0.5">{t('grades_best')}</p>
                  <p className="text-white font-semibold text-sm max-w-[140px] truncate">{bestSubject.name}</p>
                  <p className="text-white/80 text-xs">{bestSubject.avg.toFixed(1)}% — {letterGrade(bestSubject.avg)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Subject Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {allSubjects.map((subName) => {
              const avg = subjectAverages.get(subName) ?? 0;
              const color = subjects.find((s) => s.name === subName)?.color ?? '#6366f1';
              const count = gradesBySubject.get(subName)?.length ?? 0;
              return (
                <button
                  key={subName}
                  onClick={() => toggleExpanded(subName)}
                  className="text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className={`text-sm font-bold ${gradeTextColor(avg)}`}>{letterGrade(avg)}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{subName}</p>
                  <p className={`text-xl font-bold mt-0.5 ${gradeTextColor(avg)}`}>{avg.toFixed(1)}%</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{count} {t('grades_entries')}</p>
                </button>
              );
            })}
          </div>

          {/* Grade list grouped by subject */}
          <div className="space-y-3">
            {allSubjects.map((subName) => {
              const subGrades = gradesBySubject.get(subName)!;
              const avg = subjectAverages.get(subName) ?? 0;
              const color = subjects.find((s) => s.name === subName)?.color ?? '#6366f1';
              const isOpen = expanded.has(subName);
              return (
                <div key={subName} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => toggleExpanded(subName)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-gray-900 dark:text-white">{subName}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${gradeBg(avg)} ${gradeTextColor(avg)}`}>
                        {letterGrade(avg)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-bold ${gradeTextColor(avg)}`}>{avg.toFixed(1)}%</span>
                      {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide bg-gray-50 dark:bg-gray-700/50">
                        <span>{t('grades_title_col')}</span>
                        <span className="text-right">{t('grades_score')}</span>
                        <span className="text-right">{t('grades_weight')}</span>
                        <span>{t('grades_type')}</span>
                        <span />
                      </div>
                      {subGrades.map((grade) => {
                        const p = pctScore(grade);
                        return (
                          <div
                            key={grade.id}
                            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 border-t border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{grade.title}</p>
                              {grade.date && <p className="text-xs text-gray-400">{grade.date}</p>}
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${gradeTextColor(p)}`}>{p.toFixed(1)}%</p>
                              <p className="text-xs text-gray-400">{grade.score}/{grade.maxScore}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {grade.weightPct > 0 ? `${grade.weightPct}%` : '—'}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                              {TYPE_LABELS[grade.type] ?? grade.type}
                            </span>
                            <button
                              onClick={() => deleteGrade(grade.id)}
                              className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Grade Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('grades_add')}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('grades_subject')} <span className="text-red-500">*</span>
                </label>
                {subjects.length > 0 ? (
                  <select
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all cursor-pointer"
                  >
                    {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
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
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('grades_title_label')} <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Midterm Exam, Homework 3..."
                  required autoFocus
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white dark:placeholder:text-gray-500 transition-all"
                />
              </div>
              {/* Score + Max */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('grades_score')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" min={0} step={0.1}
                    value={form.score}
                    onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
                    placeholder="85" required
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white dark:placeholder:text-gray-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('grades_max_score')}</label>
                  <input
                    type="number" min={1} step={0.1}
                    value={form.maxScore}
                    onChange={(e) => setForm((p) => ({ ...p, maxScore: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                  />
                </div>
              </div>
              {/* Preview */}
              {scorePreview !== null && (
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${gradeBg(scorePreview)}`}>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('grades_preview')}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${gradeTextColor(scorePreview)}`}>{scorePreview.toFixed(1)}%</span>
                    <span className={`font-bold text-sm ${gradeTextColor(scorePreview)}`}>{letterGrade(scorePreview)}</span>
                  </div>
                </div>
              )}
              {/* Type + Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('grades_type')}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Grade['type'] }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all cursor-pointer"
                  >
                    <option value="exam">{t('grades_type_exam')}</option>
                    <option value="quiz">{t('grades_type_quiz')}</option>
                    <option value="homework">{t('grades_type_homework')}</option>
                    <option value="project">{t('grades_type_project')}</option>
                    <option value="other">{t('grades_type_other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('grades_weight')}</label>
                  <div className="relative">
                    <input
                      type="number" min={0} max={100}
                      value={form.weightPct}
                      onChange={(e) => setForm((p) => ({ ...p, weightPct: e.target.value }))}
                      className="w-full px-3 py-2 pr-7 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                  </div>
                </div>
              </div>
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('grades_date')}</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                />
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  {t('settings_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.subject || !form.title.trim() || form.score === ''}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-all"
                >
                  {saving ? t('settings_saving') : t('grades_add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
