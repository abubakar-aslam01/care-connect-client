import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorProfileService } from '../services/doctorProfile.js';
import { doctorSettingsService } from '../services/doctorSettings.js';
import { doctorNotificationsService } from '../services/doctorNotifications.js';
import Loader from '../components/Loader.jsx';
import TagCheckbox from '../components/TagCheckbox.jsx';

const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DoctorProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    availability: { days: [], startTime: '', endTime: '' },
    bio: '',
    profileImage: '',
    email: '',
    phone: '',
    timezone: 'UTC',
    language: 'en'
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const notifRef = useRef(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await doctorProfileService.get();
      const doc = data?.data?.doctor || {};
      setForm({
        name: doc.name || '',
        specialization: doc.specialization || '',
        qualification: doc.qualification || '',
        experience: doc.experience ?? '',
        consultationFee: doc.consultationFee ?? '',
        availability: {
          days: doc.availability?.days || [],
          startTime: doc.availability?.startTime || '',
          endTime: doc.availability?.endTime || ''
        },
        bio: doc.bio || '',
        profileImage: doc.profileImage || '',
        email: doc.email || '',
        phone: doc.phone || '',
        timezone: doc.timezone || 'UTC',
        language: doc.language || 'en'
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await doctorNotificationsService.list({ limit: 6 });
      setNotifItems(data?.data?.notifications || []);
      setNotifUnread(data?.data?.pagination?.unreadCount || 0);
    } catch {
      setNotifItems([]);
      setNotifUnread(0);
    }
  };

  useEffect(() => {
    if (!notifOpen) return;
    fetchNotifications();
  }, [notifOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists = prev.availability.days.includes(day);
      return {
        ...prev,
        availability: {
          ...prev.availability,
          days: exists
            ? prev.availability.days.filter((d) => d !== day)
            : [...prev.availability.days, day]
        }
      };
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await doctorProfileService.uploadImage(file);
      setForm((p) => ({ ...p, profileImage: data?.data?.profileImage || '' }));
      setMessage('Profile image updated');
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        ...form,
        experience: form.experience === '' ? undefined : Number(form.experience),
        consultationFee: form.consultationFee === '' ? undefined : Number(form.consultationFee)
      };
      await doctorProfileService.update(payload);
      setMessage('Profile updated');
      fetchProfile();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New password and confirmation must match');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await doctorSettingsService.updatePassword({
        oldPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setMessage('Password updated');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Password update failed');
    } finally {
      setSaving(false);
    }
  };

  const daySelection = useMemo(
    () => daysList.map((day) => ({ day, checked: form.availability.days.includes(day) })),
    [form.availability.days]
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">My Profile</h1>
            <p className="text-sm text-slate-600">Update your professional details.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-white text-primary shadow-sm hover:bg-primary/10"
                onClick={() => setNotifOpen((p) => !p)}
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                </svg>
                {notifUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                    {notifUnread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-800 border-b border-slate-100">
                    <span>Notifications</span>
                    <button
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/doctor/notifications');
                      }}
                    >
                      Open center
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifItems.length ? (
                      notifItems.map((n) => (
                        <div key={n._id} className="px-3 py-2 text-sm border-b border-slate-100 last:border-0">
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-600">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-xs text-slate-500">No notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {loading && <Loader />}
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {message && <p className="mt-2 text-sm text-emerald-600">{message}</p>}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              {form.profileImage ? (
                <img src={form.profileImage} alt="profile" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                  {form.name?.slice(0, 2)?.toUpperCase() || 'DR'}
                </div>
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                Upload image
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Specialization</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.specialization}
                onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Qualification</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.qualification}
              onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Experience (years)</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
              />
            </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Consultation Fee</label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.consultationFee}
              onChange={(e) => setForm((p) => ({ ...p, consultationFee: e.target.value }))}
            />
          </div>
        </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Timezone</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.timezone}
                onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                placeholder="UTC, America/New_York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Language</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.language}
                onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Availability</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {daySelection.map(({ day, checked }) => (
                <TagCheckbox key={day} label={day} checked={checked} onChange={() => toggleDay(day)} />
              ))}
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Start time</label>
                <input
                  type="time"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.availability.startTime}
                  onChange={(e) => setForm((p) => ({ ...p, availability: { ...p.availability, startTime: e.target.value } }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">End time</label>
                <input
                  type="time"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.availability.endTime}
                  onChange={(e) => setForm((p) => ({ ...p, availability: { ...p.availability, endTime: e.target.value } }))}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Bio</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={4}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Short professional bio"
            />
          </div>

          <div className="card border border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            <form className="mt-3 grid gap-4 md:grid-cols-3" onSubmit={handlePasswordChange}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Current password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Current password"
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
                  placeholder="At least 8 characters"
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
                  placeholder="Re-enter new password"
                  required
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Update password'}
                </button>
              </div>
            </form>
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
      </div>
    </div>
  );
};

export default DoctorProfile;
