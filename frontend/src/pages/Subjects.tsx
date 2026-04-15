import { Plus, BookOpen, X, Palette } from 'lucide-react';
import { useState } from 'react';
import { useSubjectStore } from '../store/useSubjectStore';
import SubjectCard from '../components/SubjectCard';
import { useT } from '../hooks/useT';

const PRESET_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#64748b',
];

const emptyForm = { name: '', color: '#6366f1', teacher: '', credits: 3 };

export default function Subjects() {
  const { subjects, isLoading, addSubject } = useSubjectStore();
  const t = useT();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalTasks = subjects.reduce((sum, s) => sum + s.taskCount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await addSubject({ name: form.name.trim(), color: form.color, teacher: form.teacher.trim(), credits: form.credits });
      setForm(emptyForm);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('subjects_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {subjects.length} {t('nav_subjects').toLowerCase()} · {totalCredits} {t('dash_credits')} · {totalTasks} {t('common_tasks')}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          {t('subjects_add')}
        </button>
      </div>

      {/* Summary bar */}
      {subjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="font-semibold text-gray-900 dark:text-white">{subjects.length}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-100 dark:bg-gray-700" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dash_credits')}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{totalCredits}</p>
          </div>
          <div className="h-8 w-px bg-gray-100 dark:bg-gray-700" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('common_tasks')}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{totalTasks}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {subjects.map((s) => (
              <div key={s.id} className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} title={s.name} />
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-36 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500 mb-4">{t('subjects_no_subjects')}</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus size={15} />
            {t('subjects_add')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('subjects_add')}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('subjects_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Calculus I"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:text-white dark:placeholder:text-gray-500 transition-all"
                />
              </div>

              {/* Teacher + Credits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('subjects_teacher')}
                  </label>
                  <input
                    value={form.teacher}
                    onChange={(e) => setForm((p) => ({ ...p, teacher: e.target.value }))}
                    placeholder="Dr. Smith"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:text-white dark:placeholder:text-gray-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('subjects_credits')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.credits}
                    onChange={(e) => setForm((p) => ({ ...p, credits: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('subjects_color')}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, color: c }))}
                      className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${
                        form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <label className="flex items-center gap-1.5 ml-1 cursor-pointer">
                    <Palette size={14} className="text-gray-400" />
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                      className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                    />
                  </label>
                </div>
                {/* Live preview */}
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: form.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate">
                    {form.name || t('subjects_name')}
                  </span>
                  {form.teacher && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                      {form.teacher}
                    </span>
                  )}
                </div>
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
                  disabled={saving || !form.name.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-all"
                >
                  {saving ? t('settings_saving') : t('subjects_add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
