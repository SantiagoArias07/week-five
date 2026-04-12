import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Bell, Globe, Shield, Trash2, ChevronRight,
  LucideIcon, Check, X, LogOut, KeyRound,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../utils/api';
import { UserSettings } from '../types';

// ── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────
function SettingRow({
  icon: Icon, label, description, rightEl,
}: {
  icon: LucideIcon; label: string; description?: string; rightEl: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">{rightEl}</div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();

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

  // Preferences
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, email: user.email });
  }, [user]);

  useEffect(() => {
    api.get<UserSettings>('/settings').then(setSettings).catch(() => {});
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
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
      setProfileMsg({ type: 'ok', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'err', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) {
      setPwMsg({ type: 'err', text: 'Passwords do not match' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await api.put('/auth/profile', { currentPassword: pwForm.current, newPassword: pwForm.new });
      setPwForm({ current: '', new: '', confirm: '' });
      setPwOpen(false);
      setPwMsg({ type: 'ok', text: 'Password changed successfully.' });
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

  const toggle = (key: keyof UserSettings, value: boolean) => {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', value);
    }
    api.put('/settings', { [key]: value }).catch(() => {});
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* ── Profile ── */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Profile</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {profileMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${profileMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {profileMsg.text}
            </div>
          )}

          {!editing ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-indigo-700">
                  {user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'WF'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <button
                  onClick={() => { setEditing(true); setProfileMsg(null); }}
                  className="text-xs text-indigo-600 hover:underline mt-1"
                >
                  Edit profile
                </button>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          ) : (
            <form onSubmit={saveProfile} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Check size={13} />
                  {profileSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setProfileForm({ name: user?.name ?? '', email: user?.email ?? '' }); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <X size={13} />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── Change Password ── */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Security</h2>
        <div className="bg-white rounded-xl border border-gray-200 px-5">
          {!pwOpen ? (
            <SettingRow
              icon={KeyRound}
              label="Change Password"
              description="Update your account password"
              rightEl={
                <button
                  onClick={() => { setPwOpen(true); setPwMsg(null); }}
                  className="text-sm text-indigo-600 hover:underline font-medium"
                >
                  Change
                </button>
              }
            />
          ) : (
            <div className="py-4">
              {pwMsg && (
                <div className={`mb-3 p-3 rounded-lg text-sm ${pwMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {pwMsg.text}
                </div>
              )}
              <form onSubmit={savePassword} className="space-y-3">
                {(['current', 'new', 'confirm'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                      {field === 'current' ? 'Current password' : field === 'new' ? 'New password' : 'Confirm new password'}
                    </label>
                    <input
                      type="password"
                      value={pwForm[field]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                      required
                      minLength={field !== 'current' ? 6 : undefined}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Check size={13} />
                    {pwSaving ? 'Saving...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPwOpen(false); setPwForm({ current: '', new: '', confirm: '' }); }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <X size={13} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── Appearance ── */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Appearance</h2>
        <div className="bg-white rounded-xl border border-gray-200 px-5">
          <SettingRow
            icon={settings?.darkMode ? Moon : Sun}
            label="Dark Mode"
            description="Switch between light and dark theme"
            rightEl={
              <Toggle
                enabled={settings?.darkMode ?? false}
                onToggle={() => toggle('darkMode', !(settings?.darkMode ?? false))}
              />
            }
          />
          <SettingRow
            icon={Globe}
            label="Language"
            description="App display language"
            rightEl={
              <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                {settings?.language === 'es' ? 'Español' : 'English'}
                <ChevronRight size={14} />
              </button>
            }
          />
        </div>
      </section>

      {/* ── Notifications ── */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Notifications</h2>
        <div className="bg-white rounded-xl border border-gray-200 px-5">
          <SettingRow
            icon={Bell}
            label="Push Notifications"
            description="Deadline and exam reminders"
            rightEl={
              <Toggle
                enabled={settings?.pushNotifications ?? true}
                onToggle={() => toggle('pushNotifications', !(settings?.pushNotifications ?? true))}
              />
            }
          />
          <SettingRow
            icon={Bell}
            label="Email Reminders"
            description="Weekly summary emails"
            rightEl={
              <Toggle
                enabled={settings?.emailReminders ?? false}
                onToggle={() => toggle('emailReminders', !(settings?.emailReminders ?? false))}
              />
            }
          />
          <SettingRow
            icon={Bell}
            label="Sound Effects"
            description="Pomodoro timer sounds"
            rightEl={
              <Toggle
                enabled={settings?.soundEffects ?? true}
                onToggle={() => toggle('soundEffects', !(settings?.soundEffects ?? true))}
              />
            }
          />
        </div>
      </section>

      {/* ── Account Danger Zone ── */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Account</h2>
        <div className="bg-white rounded-xl border border-gray-200 px-5">
          <SettingRow
            icon={Shield}
            label="Privacy & Security"
            description="Manage your data and security preferences"
            rightEl={
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            }
          />
          <div className="py-4">
            {!confirmDelete ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <Trash2 size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Delete Account</p>
                    <p className="text-xs text-gray-400 mt-0.5">Permanently remove all your data</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-1">Are you sure?</p>
                <p className="text-xs text-red-600 mb-3">
                  This will permanently delete your account, all tasks, subjects, exams, and settings.
                  This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={deleteAccount}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, delete everything
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-gray-300 mt-8">WeekFive v0.1.0</p>
    </div>
  );
}
