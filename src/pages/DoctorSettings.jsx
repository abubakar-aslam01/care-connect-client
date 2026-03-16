import { useState } from 'react';
import { toast } from 'sonner';
import { doctorSettingsService } from '../services/doctorSettings.js';

const DoctorSettings = () => {
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    notificationEmail: true,
    notificationSms: false,
    darkMode: false,
    preferredLanguage: 'en',
    timezone: 'UTC',
    defaultConsultDuration: 20,
    autoAcceptFollowups: false,
    signature: ''
  });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setError('');
    setMessage('');
    try {
      await doctorSettingsService.updateSettings(settings);
      setMessage('Settings updated');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New password and confirmation must match');
      return;
    }
    setSavingPassword(true);
    setError('');
    setMessage('');
    try {
      await doctorSettingsService.updatePassword(passwords);
      setMessage('Password updated');
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message || 'Password update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">Manage account and preferences.</p>
      </div>

      {message && <div className="text-sm text-emerald-600">{message}</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="card">
        <h2 className="text-lg font-semibold">Account</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSettingsSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Full name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={settings.name}
              onChange={(e) => setSettings((p) => ({ ...p, name: e.target.value }))}
              placeholder="Dr. Jane Smith"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={settings.email}
                onChange={(e) => setSettings((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={settings.phone}
                onChange={(e) => setSettings((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-700">Email notifications</label>
            <input
              type="checkbox"
              checked={settings.notificationEmail}
              onChange={(e) => setSettings((p) => ({ ...p, notificationEmail: e.target.checked }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-700">SMS notifications</label>
            <input
              type="checkbox"
              checked={settings.notificationSms}
              onChange={(e) => setSettings((p) => ({ ...p, notificationSms: e.target.checked }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-700">Dark mode</label>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => setSettings((p) => ({ ...p, darkMode: e.target.checked }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Preferred language</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={settings.preferredLanguage}
                onChange={(e) => setSettings((p) => ({ ...p, preferredLanguage: e.target.value }))}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Timezone</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={settings.timezone}
                onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))}
                placeholder="UTC, America/New_York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Default consult duration (min)</label>
              <input
                type="number"
                min="5"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={settings.defaultConsultDuration}
                onChange={(e) => setSettings((p) => ({ ...p, defaultConsultDuration: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">E-signature (for prescriptions)</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={settings.signature}
                onChange={(e) => setSettings((p) => ({ ...p, signature: e.target.value }))}
                placeholder="Dr. Jane Smith, MD"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-700">Auto-accept follow-up bookings</label>
            <input
              type="checkbox"
              checked={settings.autoAcceptFollowups}
              onChange={(e) => setSettings((p) => ({ ...p, autoAcceptFollowups: e.target.checked }))}
            />
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
          >
            {savingSettings ? 'Saving...' : 'Save settings'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Change password</h2>
        <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Old password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, oldPassword: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
          >
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorSettings;
