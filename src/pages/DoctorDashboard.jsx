import { useEffect, useState } from 'react';
import { appointmentService } from '../services/appointments.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';
import { formatDate, formatTime } from '../utils/format.js';

const PAGE_SIZE = 5;

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const [notesModal, setNotesModal] = useState({ open: false, id: null, notes: '' });

  const fetchData = async (pageParam = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await appointmentService.doctorList({ page: pageParam, limit: PAGE_SIZE });
      const list = data?.data?.appointments || [];
      setAppointments(list);
      setTotalPages(Math.max(1, Math.ceil((data?.data?.total || list.length) / PAGE_SIZE)));
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const updateStatus = async (id, status) => {
    setActionLoading(true);
    setError('');
    try {
      await appointmentService.updateStatus(id, status);
      fetchData(page);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNotes = async () => {
    if (!notesModal.notes) return;
    setActionLoading(true);
    try {
      await appointmentService.addNotes(notesModal.id, notesModal.notes);
      setNotesModal({ open: false, id: null, notes: '' });
      fetchData(page);
    } catch (err) {
      setError(err.message || 'Failed to add notes');
    } finally {
      setActionLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date?.startsWith?.(todayStr) || new Date(a.date).toISOString().startsWith(todayStr));
  const todayCount = todayAppointments.length || appointments.filter((a) => formatDate(a.date) === formatDate(new Date())).length;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today's appointments</h2>
          {loading && <Loader />}
        </div>
        <p className="text-sm text-slate-500 mb-2">Total today: <span className="font-semibold text-slate-900">{todayCount}</span></p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Patient</th>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Time</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Notes</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(todayAppointments.length ? todayAppointments : appointments).map((a) => (
                <tr key={a._id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{a.patientId?.name || a.patientId || '-'}</td>
                  <td className="px-3 py-2">{formatDate(a.date)}</td>
                  <td className="px-3 py-2">{formatTime(a.time)}</td>
                  <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                  <td className="px-3 py-2 text-slate-600">{a.notes || '—'}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      onClick={() => updateStatus(a._id, 'approved')}
                      disabled={actionLoading}
                      className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(a._id, 'rejected')}
                      disabled={actionLoading}
                      className="text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setNotesModal({ open: true, id: a._id, notes: a.notes || '' })}
                      className="text-sm font-semibold text-primary hover:text-primary/80"
                    >
                      Add notes
                    </button>
                  </td>
                </tr>
              ))}
              {!appointments.length && !loading && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={6}>
                    No appointments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      <Modal
        open={notesModal.open}
        title="Add prescription notes"
        onClose={() => setNotesModal({ open: false, id: null, notes: '' })}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => setNotesModal({ open: false, id: null, notes: '' })}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              onClick={handleAddNotes}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : 'Save notes'}
            </button>
          </div>
        }
      >
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          rows={5}
          value={notesModal.notes}
          onChange={(e) => setNotesModal((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Add prescription or follow-up notes"
        />
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
