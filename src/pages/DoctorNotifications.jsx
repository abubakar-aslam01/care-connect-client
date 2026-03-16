import { useEffect, useState } from 'react';
import { doctorNotificationsService } from '../services/doctorNotifications.js';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';

const DoctorNotifications = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (pageParam = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await doctorNotificationsService.list({ page: pageParam, limit: 10 });
      setItems(data?.data?.notifications || []);
      setTotalPages(data?.data?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const markRead = async (id) => {
    await doctorNotificationsService.markRead(id);
    fetchData(page);
  };

  const remove = async (id) => {
    await doctorNotificationsService.remove(id);
    fetchData(page);
  };

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-600">Appointment updates and system alerts.</p>
        </div>
      </div>

      {loading && <div className="card"><Loader /></div>}
      {error && <div className="card text-sm text-red-500">{error}</div>}

      {!loading && !error && (
        <div className="card">
          <div className="divide-y divide-slate-100">
            {items.map((n) => (
              <div key={n._id} className="flex flex-col gap-2 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-600">{n.message}</p>
                  </div>
                  <div className="flex gap-2">
                    {!n.read && (
                      <button
                        className="text-xs font-semibold text-primary hover:text-primary/80"
                        onClick={() => markRead(n._id)}
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      onClick={() => remove(n._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {!items.length && <p className="py-6 text-sm text-slate-600">No notifications.</p>}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default DoctorNotifications;
