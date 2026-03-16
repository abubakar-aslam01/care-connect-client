import { useEffect, useMemo, useState } from 'react';
import { appointmentService } from '../services/appointments.js';
import Loader from '../components/Loader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Pagination from '../components/Pagination.jsx';
import { formatDate, formatTime } from '../utils/format.js';
import { doctorService } from '../services/doctors.js';

const PAGE_SIZE = 5;

const PatientDashboard = () => {
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', notes: '' });
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(false);

  const fetchAppointments = async (pageParam = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await appointmentService.my({ page: pageParam, limit: PAGE_SIZE });
      const list = data?.data?.appointments || [];
      setAppointments(list);
      // If backend supports pagination, update; fallback to 1
      setTotalPages(Math.max(1, Math.ceil((data?.data?.total || list.length) / PAGE_SIZE)));
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchDoctors = async () => {
    setDoctorLoading(true);
    try {
      const { data } = await doctorService.publicList({ limit: 100 });
      setDoctors(data?.data?.doctors || []);
    } catch (err) {
      // silent fail; keep text input fallback
    } finally {
      setDoctorLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    if (!form.doctorId || !form.date || !form.time) {
      setError('Doctor, date and time are required');
      setSubmitting(false);
      return;
    }
    try {
      await appointmentService.create({
        doctorId: form.doctorId,
        date: form.date,
        time: form.time,
        notes: form.notes
      });
      setSuccess('Appointment booked successfully');
      setForm({ doctorId: '', date: '', time: '', notes: '' });
      fetchAppointments(page);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    setSubmitting(true);
    setError('');
    try {
      await appointmentService.cancel(id);
      fetchAppointments(page);
    } catch (err) {
      setError(err.message || 'Failed to cancel');
    } finally {
      setSubmitting(false);
    }
  };

  const statusCounts = useMemo(() => {
    return appointments.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 }
    );
  }, [appointments]);

  const upcomingCount = useMemo(() => {
    const today = new Date();
    return appointments.filter((a) => new Date(a.date) >= today).length;
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {['pending', 'approved', 'rejected'].map((s) => (
          <div key={s} className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 capitalize">{s}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{statusCounts[s]}</p>
            </div>
            <StatusBadge status={s} />
          </div>
        ))}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Upcoming</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{upcomingCount}</p>
          </div>
          <StatusBadge status={upcomingCount ? 'approved' : 'pending'} />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Book appointment</h2>
            <p className="text-sm text-slate-500">Choose doctor, date, and time.</p>
          </div>
        </div>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700">Doctor</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.doctorId}
              onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value }))}
              required
            >
              <option value="">{doctorLoading ? 'Loading doctors...' : 'Select a doctor'}</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} · {d.specialization || 'Doctor'} {d.department?.name ? `(${d.department.name})` : ''}
                </option>
              ))}
            </select>
            {doctorLoading && <p className="mt-1 text-xs text-slate-500">Fetching doctors...</p>}
          </div>
          <div className="grid gap-4 md:col-span-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Time</label>
              <input
                type="time"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.time}
                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Describe symptoms or requests"
            />
          </div>
          {error && <p className="md:col-span-2 text-sm text-red-500">{error}</p>}
          {success && <p className="md:col-span-2 text-sm text-emerald-600">{success}</p>}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Booking...' : 'Book appointment'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Appointment history</h2>
          {loading && <Loader />}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Doctor</th>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Time</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Notes</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{a.doctorId?.name || a.doctorId || '-'}</td>
                  <td className="px-3 py-2">{formatDate(a.date)}</td>
                  <td className="px-3 py-2">{formatTime(a.time)}</td>
                  <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                  <td className="px-3 py-2 text-slate-600">{a.notes || '—'}</td>
                  <td className="px-3 py-2">
                    {a.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(a._id)}
                        disabled={submitting}
                        className="text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!appointments.length && !loading && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={6}>
                    No appointments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default PatientDashboard;
