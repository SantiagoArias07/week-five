import { useState } from 'react';
import { Moon, Sun, Bell, Globe, Shield, Trash2, ChevronRight, LucideIcon } from 'lucide-react';

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
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

function SettingRow({
  icon: Icon,
  label,
  description,
  rightEl,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  rightEl: React.ReactNode;
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

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailReminders, setEmailReminders] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-0.5">Customize your WeekFive experience</p>
      </div>

      {/* Profile section */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Profile
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xl font-bold text-indigo-700">SA</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Santiago Arias</p>
              <p className="text-sm text-gray-400">santiago@example.com</p>
              <p className="text-xs text-indigo-600 mt-1 cursor-pointer hover:underline">
                Edit profile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Appearance
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 px-5">
          <SettingRow
            icon={darkMode ? Moon : Sun}
            label="Dark Mode"
            description="Switch between light and dark theme"
            rightEl={<Toggle enabled={darkMode} onToggle={() => setDarkMode((v) => !v)} />}
          />
          <SettingRow
            icon={Globe}
            label="Language"
            description="App display language"
            rightEl={
              <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                English
                <ChevronRight size={14} />
              </button>
            }
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Notifications
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 px-5">
          <SettingRow
            icon={Bell}
            label="Push Notifications"
            description="Deadline and exam reminders"
            rightEl={<Toggle enabled={notifications} onToggle={() => setNotifications((v) => !v)} />}
          />
          <SettingRow
            icon={Bell}
            label="Email Reminders"
            description="Weekly summary emails"
            rightEl={<Toggle enabled={emailReminders} onToggle={() => setEmailReminders((v) => !v)} />}
          />
          <SettingRow
            icon={Bell}
            label="Sound Effects"
            description="Pomodoro timer sounds"
            rightEl={<Toggle enabled={soundEffects} onToggle={() => setSoundEffects((v) => !v)} />}
          />
        </div>
      </section>

      {/* Account */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Account
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 px-5">
          <SettingRow
            icon={Shield}
            label="Privacy & Security"
            description="Password and data settings"
            rightEl={
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            }
          />
          <SettingRow
            icon={Trash2}
            label="Delete Account"
            description="Permanently remove your data"
            rightEl={
              <button className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                Delete
              </button>
            }
          />
        </div>
      </section>

      {/* Footer */}
      <p className="text-center text-xs text-gray-300 mt-8">WeekFive v0.1.0</p>
    </div>
  );
}
