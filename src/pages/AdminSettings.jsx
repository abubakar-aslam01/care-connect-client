import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import { adminProfileService } from '../services/adminProfile.js';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminProfileService.getSettings();
      setSettings(data?.data?.settings || {});
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminProfileService.updateSettings(settings);
      toast.success('Settings saved');
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card"><Loader /></div>;
  if (error) return <div className="card text-sm text-red-500">{error}</div>;

  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-slate-900">System Settings</h1>
      <form className="mt-4 space-y-4" onSubmit={handleSave}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Hospital Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={settings?.hospitalName || ''}
              onChange={(e) => setSettings((p) => ({ ...p, hospitalName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Contact Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={settings?.contactEmail || ''}
              onChange={(e) => setSettings((p) => ({ ...p, contactEmail: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Contact Phone</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={settings?.contactPhone || ''}
              onChange={(e) => setSettings((p) => ({ ...p, contactPhone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Timezone</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={settings?.timezone || ''}
              onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Currency</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={settings?.currency || ''}
              onChange={(e) => setSettings((p) => ({ ...p, currency: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Appointment Duration (min)</label>
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={settings?.appointmentDuration || 0}
              onChange={(e) => setSettings((p) => ({ ...p, appointmentDuration: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Default Consultation Fee</label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={settings?.defaultConsultationFee || 0}
              onChange={(e) => setSettings((p) => ({ ...p, defaultConsultationFee: Number(e.target.value) }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 mt-6">
            <input
              type="checkbox"
              checked={!!settings?.maintenanceMode}
              onChange={(e) => setSettings((p) => ({ ...p, maintenanceMode: e.target.checked }))}
            />
            Maintenance mode
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
