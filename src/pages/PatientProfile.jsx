import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { patientProfileService } from '../services/patientProfile.js';
import { patientNotificationsService } from '../services/patientNotifications.js';
import Loader from '../components/Loader.jsx';
import { toast } from 'sonner';

const tabs = ['Personal Info', 'Medical Info', 'Appointments', 'Prescriptions', 'Billing', 'Notifications', 'Settings'];

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  maritalStatus: '',
  address: { street: '', city: '', state: '', postalCode: '' },
  emergencyContact: { name: '', phone: '', relationship: '' },
  allergies: [],
  chronicDiseases: [],
  pastSurgeries: [],
  familyHistory: '',
  smokingStatus: false,
  alcoholConsumption: false,
  height: '',
  weight: '',
  bmi: '',
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: false,
  appointmentReminderEnabled: true,
  profileImage: ''
};

const PatientProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [appointmentsSummary, setAppointmentsSummary] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [billing, setBilling] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [prescPage, setPrescPage] = useState(1);
  const [prescTotalPages, setPrescTotalPages] = useState(1);
  const [notificationsList, setNotificationsList] = useState([]);
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotalPages, setNotifTotalPages] = useState(1);
  const prescriptionsRef = useRef(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await patientProfileService.getProfile();
      const p = data?.data?.patient || {};
      setProfile((prev) => ({ ...prev, ...p }));
      setImagePreview(p.profileImage || '');
    } catch (err) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const { data } = await patientProfileService.getAppointmentsSummary();
      setAppointmentsSummary(data?.data || null);
    } catch (err) {
      /* ignore summary errors */
    }
  };

  const fetchBilling = async () => {
    try {
      const { data } = await patientProfileService.getBilling();
      setBilling(data?.data || null);
    } catch (err) {
      /* ignore billing errors */
    }
  };

  const fetchNotifications = async (page = 1) => {
    try {
      const { data } = await patientNotificationsService.list({ page, limit: 10 });
      setNotificationsList(data?.data?.notifications || []);
      setNotifTotalPages(data?.data?.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(err.message || 'Failed to load notifications');
    }
  };

  const fetchPrescriptions = async (page = 1) => {
    try {
      const { data } = await patientProfileService.getPrescriptions({ page, limit: 10 });
      setPrescriptions(data?.data?.prescriptions || []);
      setPrescTotalPages(data?.data?.pagination?.totalPages || 1);
    } catch (err) {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSummary();
    fetchBilling();
    fetchPrescriptions();
    fetchNotifications();
  }, []);

  useEffect(() => {
    fetchPrescriptions(prescPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescPage]);

  useEffect(() => {
    fetchNotifications(notifPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifPage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tabs.includes(tab)) {
      setActiveTab(tab);
      if (tab === 'Prescriptions' && prescriptionsRef.current) {
        prescriptionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.search]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...profile };
      await patientProfileService.updateProfile(payload);
      toast.success('Profile updated');
      fetchProfile();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const { data } = await patientProfileService.uploadImage(file);
      const url = data?.data?.profileImage;
      setProfile((p) => ({ ...p, profileImage: url }));
      setImagePreview(url);
      toast.success('Profile image updated');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const renderPersonal = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {imagePreview ? (
          <img src={imagePreview} alt="profile" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
            {profile.name?.slice(0, 2)?.toUpperCase() || 'PT'}
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          Upload image
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.phone || ''}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : ''}
            onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Gender</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.gender || ''}
            onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
          >
            <option value="">Select</option>
            {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Blood Group</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.bloodGroup || ''}
            onChange={(e) => setProfile((p) => ({ ...p, bloodGroup: e.target.value }))}
          >
            <option value="">Select</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Marital Status</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.maritalStatus || ''}
            onChange={(e) => setProfile((p) => ({ ...p, maritalStatus: e.target.value }))}
          >
            <option value="">Select</option>
            {['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Other'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Address</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Street"
            value={profile.address?.street || ''}
            onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, street: e.target.value } }))}
          />
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="City"
              value={profile.address?.city || ''}
              onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, city: e.target.value } }))}
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="State"
              value={profile.address?.state || ''}
              onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, state: e.target.value } }))}
            />
          </div>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Postal Code"
            value={profile.address?.postalCode || ''}
            onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, postalCode: e.target.value } }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Emergency Contact</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Name"
            value={profile.emergencyContact?.name || ''}
            onChange={(e) => setProfile((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, name: e.target.value } }))}
          />
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Phone"
              value={profile.emergencyContact?.phone || ''}
              onChange={(e) => setProfile((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, phone: e.target.value } }))}
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Relationship"
              value={profile.emergencyContact?.relationship || ''}
              onChange={(e) => setProfile((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, relationship: e.target.value } }))}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedical = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Allergies (comma separated)</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.allergies?.join(', ') || ''}
            onChange={(e) => setProfile((p) => ({ ...p, allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Chronic Diseases (comma separated)</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.chronicDiseases?.join(', ') || ''}
            onChange={(e) => setProfile((p) => ({ ...p, chronicDiseases: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Past Surgeries (comma separated)</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.pastSurgeries?.join(', ') || ''}
            onChange={(e) => setProfile((p) => ({ ...p, pastSurgeries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Family History</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.familyHistory || ''}
            onChange={(e) => setProfile((p) => ({ ...p, familyHistory: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={!!profile.smokingStatus} onChange={(e) => setProfile((p) => ({ ...p, smokingStatus: e.target.checked }))} />
          Smoking
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={!!profile.alcoholConsumption} onChange={(e) => setProfile((p) => ({ ...p, alcoholConsumption: e.target.checked }))} />
          Alcohol
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Height (cm)</label>
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.height || ''}
            onChange={(e) => setProfile((p) => ({ ...p, height: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Weight (kg)</label>
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={profile.weight || ''}
            onChange={(e) => setProfile((p) => ({ ...p, weight: e.target.value }))}
          />
        </div>
        <div>
          <p className="text-sm text-slate-700">BMI</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{profile.bmi || '—'}</p>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-3">
      {!appointmentsSummary ? (
        <p className="text-sm text-slate-600">No data</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card"><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-semibold">{appointmentsSummary.totalAppointments}</p></div>
          <div className="card"><p className="text-sm text-slate-500">Upcoming</p><p className="text-2xl font-semibold">{appointmentsSummary.upcomingAppointments}</p></div>
          <div className="card"><p className="text-sm text-slate-500">Completed</p><p className="text-2xl font-semibold">{appointmentsSummary.completedAppointments}</p></div>
          <div className="card"><p className="text-sm text-slate-500">Cancelled</p><p className="text-2xl font-semibold">{appointmentsSummary.cancelledAppointments}</p></div>
        </div>
      )}
    </div>
  );

  const renderPrescriptions = () => (
    <div ref={prescriptionsRef} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {prescriptions.map((p) => (
          <div key={p.id} className="card">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-900">Doctor: {p.doctor?.name || 'N/A'}</span>
              <span className="text-slate-500">{new Date(p.date).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-slate-600">Diagnosis: {p.diagnosis || '—'}</p>
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              {p.medicines?.map((m, idx) => (
                <div key={m.medicine?._id || m.medicine || idx} className="rounded border border-slate-200 px-3 py-2">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>{m.medicine?.name || 'Medicine'}</span>
                    <span>x {m.quantity}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Dose: {m.dose || '—'} • Frequency: {m.frequency || '—'} • Duration: {m.duration || '—'}</p>
                  <p className="text-[11px] text-slate-500">Notes: {m.notes || 'No notes'}</p>
                  <p className="text-[11px] text-slate-500">Price: ${((m.price || 0) * m.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            {p.notes && <p className="mt-2 text-xs text-slate-600">Doctor notes: {p.notes}</p>}
          </div>
        ))}
      </div>
      {!prescriptions.length && <p className="text-sm text-slate-600">No prescriptions.</p>}
      <div className="flex gap-2 text-sm">
        <button disabled={prescPage <= 1} onClick={() => setPrescPage((p) => Math.max(1, p - 1))} className="rounded border px-3 py-1 disabled:opacity-50">Prev</button>
        <span>Page {prescPage} / {prescTotalPages}</span>
        <button disabled={prescPage >= prescTotalPages} onClick={() => setPrescPage((p) => p + 1)} className="rounded border px-3 py-1 disabled:opacity-50">Next</button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-3">
      {notificationsList.map((n) => (
        <div key={n._id} className="card border border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-900">{n.title || 'Notification'}</span>
            <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
          </div>
          <p className="mt-1 text-xs text-slate-700">{n.message || n.body || '—'}</p>
          <p className="text-[11px] text-slate-500 mt-1">{n.type || 'general'} • {n.read ? 'Read' : 'Unread'}</p>
        </div>
      ))}
      {!notificationsList.length && <p className="text-sm text-slate-600">No notifications.</p>}
      <div className="flex gap-2 text-sm">
        <button disabled={notifPage <= 1} onClick={() => setNotifPage((p) => Math.max(1, p - 1))} className="rounded border px-3 py-1 disabled:opacity-50">Prev</button>
        <span>Page {notifPage} / {notifTotalPages}</span>
        <button disabled={notifPage >= notifTotalPages} onClick={() => setNotifPage((p) => p + 1)} className="rounded border px-3 py-1 disabled:opacity-50">Next</button>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-3">
      {!billing ? (
        <p className="text-sm text-slate-600">No billing data.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card"><p className="text-sm text-slate-500">Consultation Fees</p><p className="text-2xl font-semibold">${billing.totalConsultationFees || 0}</p></div>
          <div className="card"><p className="text-sm text-slate-500">Pharmacy Purchases</p><p className="text-2xl font-semibold">${billing.pharmacyPurchases || 0}</p></div>
          <div className="card"><p className="text-sm text-slate-500">Total Spent</p><p className="text-2xl font-semibold">${billing.totalSpent || 0}</p></div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-800">Email address</label>
          <input
            type="email"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            placeholder="your.name@hospital.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Phone number</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+1 555 123 4567"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-800">Current password</label>
          <input
            type="password"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
            placeholder="Current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">New password</label>
          <input
            type="password"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Confirm new password</label>
          <input
            type="password"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            placeholder="Re-enter new password"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={!!profile.emailNotificationsEnabled}
            onChange={(e) => setProfile((p) => ({ ...p, emailNotificationsEnabled: e.target.checked }))}
          />
          Email notifications
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={!!profile.smsNotificationsEnabled}
            onChange={(e) => setProfile((p) => ({ ...p, smsNotificationsEnabled: e.target.checked }))}
          />
          SMS notifications
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={!!profile.appointmentReminderEnabled}
            onChange={(e) => setProfile((p) => ({ ...p, appointmentReminderEnabled: e.target.checked }))}
          />
          Appointment reminders
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={!!profile.twoFactorEnabled}
            onChange={(e) => setProfile((p) => ({ ...p, twoFactorEnabled: e.target.checked }))}
          />
          Two-factor authentication
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-800">Preferred language</label>
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={profile.preferredLanguage || 'en'}
            onChange={(e) => setProfile((p) => ({ ...p, preferredLanguage: e.target.value }))}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Timezone</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={profile.timezone || ''}
            onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
            placeholder="UTC, America/Chicago"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            if (passwordForm.newPassword && passwordForm.newPassword === passwordForm.confirmPassword) {
              toast.success('Password fields captured. Submit to apply changes.');
            } else {
              toast.error('New password fields do not match.');
            }
          }}
          className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          Validate password
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Personal Info':
        return renderPersonal();
      case 'Medical Info':
        return renderMedical();
      case 'Appointments':
        return renderAppointments();
      case 'Prescriptions':
        return renderPrescriptions();
      case 'Billing':
        return renderBilling();
      case 'Notifications':
        return renderNotifications();
      case 'Settings':
        return renderSettings();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Patient Profile</h1>
            <p className="text-sm text-slate-600">Manage your information and preferences.</p>
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

      {prescriptions.length > 0 && (
        <div className="card border border-primary/20 bg-primary/5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">You have {prescriptions.length} prescriptions available.</p>
              <p className="text-xs text-slate-700">Review your doctor-recommended medicines and notes.</p>
            </div>
            <button
              className="rounded-lg border border-primary/30 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
              onClick={() => {
                setActiveTab('Prescriptions');
                prescriptionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              View prescriptions
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? <Loader /> : (
          <form onSubmit={handleSave} className="space-y-6">
            {renderTabContent()}
            {['Personal Info', 'Medical Info', 'Settings'].includes(activeTab) && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
