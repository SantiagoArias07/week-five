import { Plus, ClipboardList, X } from 'lucide-react';
import { useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import { useSubjectStore } from '../store/useSubjectStore';
import ExamCard from '../components/ExamCard';
import { useT } from '../hooks/useT';

const emptyForm = {
  title: '',
  subject: '',
  subjectColor: '#6366f1',
  date: '',
  topics: '',
  room: '',
};

export default function Exams() {
  const { exams, isLoading, addExam } = useExamStore();
  const subjects = useSubjectStore((s) => s.subjects);
  const t = useT();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const upcoming = exams.slice(0, 2);
  const later = exams.slice(2);

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
      });
      setForm(emptyForm);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

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
                  <ExamCard key={exam.id} exam={exam} />
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
                  <ExamCard key={exam.id} exam={exam} />
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

      {/* Add Exam Modal */}
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

            {/* Form */}
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
    </div>
  );
}
