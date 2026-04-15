import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Bell, Globe, Shield, Trash2,
  LucideIcon, Check, X, LogOut, KeyRound, Volume2,
  Mail, BellOff,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { api } from '../utils/api';
import { UserSettings } from '../types';
import { useT } from '../hooks/useT';

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
        enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function SettingRow({
  icon: Icon, label, description, rightEl,
}: {
  icon: LucideIcon; label: string; description?: string; rightEl: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
          {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">{rightEl}</div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function Section({ label }: { label: string }) {
  return (
    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
      {label}
    </h2>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const { darkMode, setDarkMode, language, setLanguage } = useUIStore();
  const t = useT();

  // Profile edit
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Password change
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Delete account
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Remote preferences (push, email, sound)
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Language selector open
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, email: user.email });
  }, [user]);

  useEffect(() => {
    api.get<UserSettings>('/settings').then(setSettings).catch(() => {});
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const updated = await api.put<{ id: number; name: string; email: string }>('/auth/profile', {
        name: profileForm.name,
        email: profileForm.email,
      });
      setUser(updated);
      setEditing(false);
      setProfileMsg({ type: 'ok', text: t('settings_profile_updated') });
    } catch (err) {
      setProfileMsg({ type: 'err', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) {
      setPwMsg({ type: 'err', text: t('settings_passwords_no_match') });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await api.put('/auth/profile', { currentPassword: pwForm.current, newPassword: pwForm.new });
      setPwForm({ current: '', new: '', confirm: '' });
      setPwOpen(false);
      setPwMsg({ type: 'ok', text: t('settings_password_changed') });
    } catch (err) {
      setPwMsg({ type: 'err', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setPwSaving(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.del('/auth/account');
      logout();
      navigate('/login');
    } catch {
      setConfirmDelete(false);
    }
  };

  /** Toggle a boolean preference (push, email, sound) */
  const togglePref = (key: keyof UserSettings, value: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    api.put('/settings', { [key]: value }).catch(() => {});
  };

  /** Toggle dark mode: sync to UIStore + API */
  const handleDarkMode = (value: boolean) => {
    setDarkMode(value);
    if (settings) setSettings({ ...settings, darkMode: value });
    api.put('/settings', { darkMode: value }).catch(() => {});
  };

  /** Change language: sync to UIStore + API */
  const handleLanguage = (lang: 'en' | 'es') => {
    setLanguage(lang);
    if (settings) setSettings({ ...settings, language: lang });
    api.put('/settings', { language: lang }).catch(() => {});
    setLangOpen(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings_title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">{t('settings_subtitle')}</p>
      </div>

      {/* ── Profile ── */}
      <section className="mb-6">
        <Section label={t('settings_profile')} />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          {profileMsg && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${
              profileMsg.type === 'ok'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            }`}>
              {profileMsg.text}
            </div>
          )}

          {!editing ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">
                  {user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'WF'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">{user?.email}</p>
                <button
                  onClick={() => { setEditing(true); setProfileMsg(null); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                >
                  {t('settings_edit_profile')}
                </button>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <LogOut size={14} />
                {t('settings_log_out')}
              </button>
            </div>
          ) : (
            <form onSubmit={saveProfile} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('settings_name')}</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:text-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('settings_email')}</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:text-white transition"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Check size={13} />
                  {profileSaving ? t('settings_saving') : t('settings_save')}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setProfileForm({ name: user?.name ?? '', email: user?.email ?? '' }); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={13} />
                  {t('settings_cancel')}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── Security ── */}
      <section className="mb-6">
        <Section label={t('settings_security')} />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5">
          {pwMsg && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${
              pwMsg.type === 'ok'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            }`}>
              {pwMsg.text}
            </div>
          )}
          {!pwOpen ? (
            <SettingRow
              icon={KeyRound}
              label={t('settings_change_password')}
              description={t('settings_change_password_desc')}
              rightEl={
                <button
                  onClick={() => { setPwOpen(true); setPwMsg(null); }}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  {t('settings_change')}
                </button>
              }
            />
          ) : (
            <div className="py-4">
              <form onSubmit={savePassword} className="space-y-3">
                {(['current', 'new', 'confirm'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
                      {field === 'current' ? t('settings_current_password') : field === 'new' ? t('settings_new_password') : t('settings_confirm_password')}
                    </label>
                    <input
                      type="password"
                      value={pwForm[field]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                      required
                      minLength={field !== 'current' ? 6 : undefined}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition"
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Check size={13} />
                    {pwSaving ? t('settings_saving') : t('settings_update_password')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPwOpen(false); setPwForm({ current: '', new: '', confirm: '' }); }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={13} />
                    {t('settings_cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── Appearance ── */}
      <section className="mb-6">
        <Section label={t('settings_appearance')} />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5">
          <SettingRow
            icon={darkMode ? Moon : Sun}
            label={t('settings_dark_mode')}
            description={t('settings_dark_mode_desc')}
            rightEl={
              <Toggle
                enabled={darkMode}
                onToggle={() => handleDarkMode(!darkMode)}
              />
            }
          />
          <SettingRow
            icon={Globe}
            label={t('settings_language')}
            description={t('settings_language_desc')}
            rightEl={
              <div className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <span>{language === 'es' ? '🇲🇽' : '🇺🇸'}</span>
                  {language === 'es' ? 'Español' : 'English'}
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={() => handleLanguage('en')}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        language === 'en' ? 'font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span>🇺🇸</span> English
                      {language === 'en' && <Check size={13} className="ml-auto" />}
                    </button>
                    <button
                      onClick={() => handleLanguage('es')}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        language === 'es' ? 'font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span>🇲🇽</span> Español
                      {language === 'es' && <Check size={13} className="ml-auto" />}
                    </button>
                  </div>
                )}
              </div>
            }
          />
        </div>
      </section>

      {/* ── Notifications ── */}
      <section className="mb-6">
        <Section label={t('settings_notifications')} />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5">
          <SettingRow
            icon={Bell}
            label={t('settings_push_notifs')}
            description={t('settings_push_notifs_desc')}
            rightEl={
              <Toggle
                enabled={settings?.pushNotifications ?? true}
                onToggle={() => togglePref('pushNotifications', !(settings?.pushNotifications ?? true))}
              />
            }
          />
          <SettingRow
            icon={Mail}
            label={t('settings_email_reminders')}
            description={t('settings_email_reminders_desc')}
            rightEl={
              <Toggle
                enabled={settings?.emailReminders ?? false}
                onToggle={() => togglePref('emailReminders', !(settings?.emailReminders ?? false))}
              />
            }
          />
          <SettingRow
            icon={Volume2}
            label={t('settings_sound_effects')}
            description={t('settings_sound_effects_desc')}
            rightEl={
              <Toggle
                enabled={settings?.soundEffects ?? true}
                onToggle={() => togglePref('soundEffects', !(settings?.soundEffects ?? true))}
              />
            }
          />
          {/* Reminder status info */}
          <div className="py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              {settings?.pushNotifications
                ? <Bell size={15} className="text-indigo-500" />
                : <BellOff size={15} className="text-gray-400 dark:text-gray-500" />
              }
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {settings?.pushNotifications
                ? (language === 'es'
                    ? 'Recibirás recordatorios automáticos de tareas y exámenes próximos.'
                    : 'You\'ll receive automatic reminders for upcoming tasks and exams.')
                : (language === 'es'
                    ? 'Las notificaciones push están desactivadas.'
                    : 'Push notifications are disabled.')
              }
            </p>
          </div>
        </div>
      </section>

      {/* ── Account ── */}
      <section>
        <Section label={t('settings_account')} />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5">
          <SettingRow
            icon={Shield}
            label={t('settings_privacy')}
            description={t('settings_privacy_desc')}
            rightEl={
              <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                {language === 'es' ? 'Seguro' : 'Secure'}
              </span>
            }
          />
          <div className="py-4">
            {!confirmDelete ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <Trash2 size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('settings_delete_account')}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('settings_delete_account_desc')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  {t('settings_delete')}
                </button>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">{t('settings_confirm_delete_title')}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">{t('settings_confirm_delete_desc')}</p>
                <div className="flex gap-2">
                  <button
                    onClick={deleteAccount}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    {t('settings_yes_delete')}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('settings_cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-8">{t('settings_version')}</p>
    </div>
  );
}
