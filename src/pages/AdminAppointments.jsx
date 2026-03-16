import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { adminDashboardService } from '../services/adminDashboard.js';

const PAGE_SIZE = 10;

const AdminAppointments = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (pageParam = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageParam, limit: PAGE_SIZE };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await adminDashboardService.appointments(params);
      const list = data?.data?.appointments || [];
      setItems(list);
      setTotalPages(Math.max(1, data?.data?.pagination?.totalPages || 1));
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-600">All appointments with status.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading && <Loader />}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">Patient</th>
                  <th className="px-3 py-2 font-semibold">Doctor</th>
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Time</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a._id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-900">{a.patientId?.name || 'Patient'}</td>
                    <td className="px-3 py-2 text-slate-700">{a.doctorId?.name || 'Doctor'}</td>
                    <td className="px-3 py-2 text-slate-700">{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2 text-slate-700">{a.time || '—'}</td>
                    <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td className="px-3 py-4 text-center text-slate-500" colSpan={5}>No appointments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AdminAppointments;
