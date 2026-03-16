import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import { api } from '../services/api.js';

const PAGE_SIZE = 10;

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchPatients = async (pageParam = 1) => {
    setLoading(true);
    setError('');
    try {
      // If you add a dedicated admin patients endpoint, swap here.
      const { data } = await api.get('/users', { params: { role: 'patient', page: pageParam, limit: PAGE_SIZE, search } });
      const list = data?.data?.users || [];
      setPatients(list);
      setTotalPages(Math.max(1, data?.data?.pagination?.totalPages || 1));
    } catch (err) {
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-600">Manage patient records.</p>
        </div>
        <input
          className="w-full md:w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Search patients"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card">
        {loading && <Loader />}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Email</th>
                  <th className="px-3 py-2 font-semibold">Phone</th>
                  <th className="px-3 py-2 font-semibold">DOB</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-900">{p.name}</td>
                    <td className="px-3 py-2 text-slate-700">{p.email}</td>
                    <td className="px-3 py-2 text-slate-700">{p.phone || '—'}</td>
                    <td className="px-3 py-2 text-slate-700">{p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {!patients.length && (
                  <tr><td className="px-3 py-4 text-center text-slate-500" colSpan={4}>No patients found.</td></tr>
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

export default AdminPatients;
