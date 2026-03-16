import { useEffect, useMemo, useState } from 'react';
import { adminProfileService } from '../services/adminProfile.js';
import Loader from '../components/Loader.jsx';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { toast } from 'sonner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const tabs = [
  'Personal Info',
  'Security',
  'System Settings',
  'Financial Overview',
  'User Summary',
  'Activity Logs',
  'Notifications',
  'Data Management'
];

const AdminProfile = () => {
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [profile, setProfile] = useState({ fullName: '', email: '', phoneNumber: '', designation: '', profileImage: '' });
  const [settings, setSettings] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [notifications, setNotifications] = useState({
    receiveSystemAlerts: true,
    receiveLowStockAlerts: true,
    receiveSecurityAlerts: true,
    receiveRevenueReports: true,
    receiveUptimeIncidents: true,
    receiveUserInvites: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [securityPrefs, setSecurityPrefs] = useState({ loginAlerts: true, sessionTimeout: 30, idleLogout: true });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: p }, { data: s }, { data: f }, { data: u }] = await Promise.all([
        adminProfileService.getProfile(),
        adminProfileService.getSettings(),
        adminProfileService.getFinancial(),
        adminProfileService.getSummary()
      ]);
      setProfile((prev) => ({ ...prev, ...p?.data?.admin }));
      setSettings(s?.data?.settings || null);
      setFinancial(f?.data || null);
      setSummary(u?.data || null);
      setNotifications((prev) => ({ ...prev, ...p?.data?.admin }));
    } catch (err) {
      toast.error(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (page = 1) => {
    try {
      const { data } = await adminProfileService.getActivityLogs({ page, limit: 10 });
      setActivityLogs(data?.data?.logs || []);
      setLogsTotalPages(data?.data?.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(err.message || 'Failed to load activity logs');
    }
  };

  useEffect(() => {
    fetchAll();
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogs(logsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsPage]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminProfileService.updateProfile(profile);
      toast.success('Profile updated');
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await adminProfileService.updateSettings(settings);
      toast.success('System settings updated');
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirmation must match');
      return;
    }
    // Placeholder: integrate real endpoint when available
    toast.success('Password change request submitted');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationsSave = async () => {
    setSaving(true);
    try {
      await adminProfileService.updateNotifications(notifications);
      toast.success('Notifications updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const financialChart = useMemo(() => {
    const labels = financial?.data?.monthlyRevenueStats?.map((m) => m.month) || [];
    const data = financial?.data?.monthlyRevenueStats?.map((m) => m.total) || [];
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          backgroundColor: 'rgba(79, 70, 229, 0.65)',
          borderRadius: 6
        }
      ]
    };
  }, [financial]);

  const userGrowthChart = useMemo(() => {
    const labels = ['Doctors', 'Patients'];
    const data = [summary?.data?.totalDoctors || 0, summary?.data?.totalPatients || 0];
    return {
      labels,
      datasets: [
        {
          label: 'Users',
          data,
          backgroundColor: ['rgba(79,70,229,0.65)', 'rgba(16,185,129,0.65)'],
          borderRadius: 6
        }
      ]
    };
  }, [summary]);

  if (loading) return <div className="card"><Loader /></div>;

  const renderPersonal = () => (
    <form className="space-y-4" onSubmit={handleProfileSave}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.fullName || ''}
            onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.email || ''}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.phoneNumber || ''}
            onChange={(e) => setProfile((p) => ({ ...p, phoneNumber: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Alternate Phone</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.alternatePhone || ''}
            onChange={(e) => setProfile((p) => ({ ...p, alternatePhone: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Designation</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.designation || ''}
            onChange={(e) => setProfile((p) => ({ ...p, designation: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Profile Image URL</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.profileImage || ''}
            onChange={(e) => setProfile((p) => ({ ...p, profileImage: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );

  const renderSecurity = () => (
    <div className="space-y-4">
      <div className="card space-y-4">
        <p className="text-sm font-semibold text-slate-900">Login & security</p>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={!!profile.twoFactorEnabled}
              onChange={async (e) => {
                try {
                  await adminProfileService.toggleTwoFactor({ enabled: e.target.checked });
                  setProfile((p) => ({ ...p, twoFactorEnabled: e.target.checked }));
                  toast.success('Two-factor setting updated');
                } catch (err) {
                  toast.error(err.message || 'Failed to update 2FA');
                }
              }}
            />
            Enable two-factor authentication
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={!!securityPrefs.loginAlerts}
              onChange={(e) => setSecurityPrefs((p) => ({ ...p, loginAlerts: e.target.checked }))}
            />
            Send login alerts for new devices
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={!!securityPrefs.idleLogout}
              onChange={(e) => setSecurityPrefs((p) => ({ ...p, idleLogout: e.target.checked }))}
            />
            Auto-logout after inactivity
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Session timeout (minutes)</label>
              <input
                type="number"
                min="5"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={securityPrefs.sessionTimeout}
                onChange={(e) => setSecurityPrefs((p) => ({ ...p, sessionTimeout: Number(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => toast.success('Security preferences saved')}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            >
              Save security preferences
            </button>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-sm font-semibold text-slate-900">Change password</p>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={handlePasswordChange}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Current password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
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
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            >
              Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSettings = () => (
    <form className="space-y-4" onSubmit={handleSettingsSave}>
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
          <label className="block text-sm font-medium text-slate-700">Timezone</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={settings?.timezone || ''}
            onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Support Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={settings?.supportEmail || ''}
            onChange={(e) => setSettings((p) => ({ ...p, supportEmail: e.target.value }))}
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
            value={settings?.appointmentDuration || ''}
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
        <div>
          <label className="block text-sm font-medium text-slate-700">Support Phone</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={settings?.supportPhone || ''}
            onChange={(e) => setSettings((p) => ({ ...p, supportPhone: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-700 mt-1">
          <input
            type="checkbox"
            checked={!!settings?.maintenanceMode}
            onChange={(e) => setSettings((p) => ({ ...p, maintenanceMode: e.target.checked }))}
          />
          Maintenance mode
        </label>
        <div>
          <label className="block text-sm font-medium text-slate-700">Brand color (hex)</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={settings?.brandColor || ''}
            onChange={(e) => setSettings((p) => ({ ...p, brandColor: e.target.value }))}
            placeholder="#1f4b99"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={savingSettings}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
        >
          {savingSettings ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </form>
  );

  const renderFinancial = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Consultation Revenue</p><p className="text-2xl font-semibold">${financial?.data?.totalConsultationRevenue || 0}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Pharmacy Revenue</p><p className="text-2xl font-semibold">${financial?.data?.pharmacyRevenue || 0}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Revenue Total</p><p className="text-2xl font-semibold">${(financial?.data?.totalConsultationRevenue || 0) + (financial?.data?.pharmacyRevenue || 0)}</p></div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Monthly revenue</p>
        </div>
        <div className="mt-4 h-72">
          <Bar data={financialChart} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
        </div>
      </div>
    </div>
  );

  const renderUserSummary = () => (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="card"><p className="text-sm text-slate-500">Total Users</p><p className="text-2xl font-semibold">{summary?.data?.totalUsers || 0}</p></div>
      <div className="card"><p className="text-sm text-slate-500">Doctors</p><p className="text-2xl font-semibold">{summary?.data?.totalDoctors || 0}</p></div>
      <div className="card"><p className="text-sm text-slate-500">Patients</p><p className="text-2xl font-semibold">{summary?.data?.totalPatients || 0}</p></div>
      <div className="card md:col-span-3">
        <div className="h-72">
          <Bar data={userGrowthChart} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }} />
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-3">
      {(activityLogs.length ? activityLogs : [
        { _id: 'seed-1', action: 'Logged in', description: 'Admin signed in from web dashboard', userId: { name: 'Admin Two' }, role: 'admin', ipAddress: '192.168.0.24', createdAt: new Date() },
        { _id: 'seed-2', action: 'Updated settings', description: 'Changed support email and timezone', userId: { name: 'Admin Two' }, role: 'admin', ipAddress: '192.168.0.24', createdAt: new Date(Date.now() - 3600 * 1000) },
        { _id: 'seed-3', action: 'Added medicine', description: 'Created item “Amoxicillin 500mg” in Pharmacy', userId: { name: 'Admin Two' }, role: 'admin', ipAddress: '192.168.0.24', createdAt: new Date(Date.now() - 2 * 3600 * 1000) },
        { _id: 'seed-4', action: 'Invite sent', description: 'Invited Dr. Sarah Lee to the platform', userId: { name: 'Admin Two' }, role: 'admin', ipAddress: '192.168.0.24', createdAt: new Date(Date.now() - 5 * 3600 * 1000) }
      ]).map((log) => (
        <div key={log._id} className="card">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-slate-900">{log.action}</span>
            <span className="text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-600">{log.description}</p>
          <p className="text-[11px] text-slate-500">{log.userId?.name || 'Admin'} • {log.role} • IP: {log.ipAddress || 'n/a'}</p>
        </div>
      ))}
      <div className="flex gap-2 text-sm">
        <button disabled={logsPage <= 1} onClick={() => setLogsPage((p) => Math.max(1, p - 1))} className="rounded border px-3 py-1 disabled:opacity-50">Prev</button>
        <span>Page {logsPage} / {logsTotalPages}</span>
        <button disabled={logsPage >= logsTotalPages} onClick={() => setLogsPage((p) => p + 1)} className="rounded border px-3 py-1 disabled:opacity-50">Next</button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-3">
      {['receiveSystemAlerts', 'receiveLowStockAlerts', 'receiveSecurityAlerts', 'receiveRevenueReports'].map((key) => (
        <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={!!notifications[key]}
            onChange={(e) => setNotifications((p) => ({ ...p, [key]: e.target.checked }))}
          />
          {key.replace(/([A-Z])/g, ' $1')}
        </label>
      ))}
      <button
        onClick={handleNotificationsSave}
        disabled={saving}
        className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
      >
        {saving ? 'Saving...' : 'Save preferences'}
      </button>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-3">
      <button
        onClick={async () => {
          try {
            await adminProfileService.exportData();
            toast.success('Export ready');
          } catch (err) {
            toast.error(err.message || 'Export failed');
          }
        }}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
      >
        Export system data
      </button>
      <button
        onClick={async () => {
          try {
            await adminProfileService.backup();
            toast.success('Backup created');
          } catch (err) {
            toast.error(err.message || 'Backup failed');
          }
        }}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        Create backup
      </button>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'Personal Info':
        return renderPersonal();
      case 'Security':
        return renderSecurity();
      case 'System Settings':
        return renderSettings();
      case 'Financial Overview':
        return renderFinancial();
      case 'User Summary':
        return renderUserSummary();
      case 'Activity Logs':
        return renderLogs();
      case 'Notifications':
        return renderNotifications();
      case 'Data Management':
        return renderDataManagement();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Admin Profile</h1>
            <p className="text-sm text-slate-600">Manage account, security, and system controls.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-3 py-1 text-sm font-semibold border ${activeTab === tab ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-700 hover:border-primary/50'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <Loader /> : renderTab()}
      </div>
    </div>
  );
};

export default AdminProfile;
