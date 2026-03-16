import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { adminDashboardService } from '../services/adminDashboard.js';
import Loader from '../components/Loader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: s }, { data: f }, { data: appt }] = await Promise.all([
        adminDashboardService.summary(),
        adminDashboardService.financial(),
        adminDashboardService.appointments({ page: 1, limit: 6 })
      ]);
      setSummary(s?.data);
      setFinancial(f?.data);
      const list = appt?.data?.appointments || [];
      setAppointments(list);
      setTotalPages(Math.max(1, appt?.data?.pagination?.totalPages || 1));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const revenueChart = useMemo(() => {
    const labels = financial?.monthlyRevenueStats?.map((m) => m.month) || [];
    const data = financial?.monthlyRevenueStats?.map((m) => m.total) || [];
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderRadius: 6
        }
      ]
    };
  }, [financial]);

  if (loading) return <div className="card"><Loader /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => navigate('/admin/patients')}
          className="card text-left transition hover:shadow-md"
        >
          <p className="text-sm text-slate-500">Users</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary?.totalUsers || 0}</p>
          <p className="text-xs text-slate-500">Doctors: {summary?.totalDoctors || 0} • Patients: {summary?.totalPatients || 0}</p>
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/appointments')}
          className="card text-left transition hover:shadow-md"
        >
          <p className="text-sm text-slate-500">Appointments</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary?.totalAppointments || 0}</p>
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/patients')}
          className="card text-left transition hover:shadow-md"
        >
          <p className="text-sm text-slate-500">Active Users</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary?.activeUsers || 0}</p>
          <p className="text-xs text-slate-500">Suspended: {summary?.suspendedUsers || 0}</p>
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/reports')}
          className="card text-left transition hover:shadow-md"
        >
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            ${((financial?.totalConsultationRevenue || 0) + (financial?.pharmacyRevenue || 0)).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">Consultation: ${financial?.totalConsultationRevenue || 0} • Pharmacy: ${financial?.pharmacyRevenue || 0}</p>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Monthly revenue</h2>
          </div>
          <div className="mt-4 h-80">
            <Bar
              data={revenueChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
              }}
            />
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">Latest appointments</h2>
          <div className="mt-3 space-y-2">
            {appointments.map((a) => (
              <div key={a._id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex justify-between text-sm font-semibold text-slate-900">
                  <span>{a.patientId?.name || 'Patient'}</span>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-xs text-slate-600">{a.doctorId?.name || 'Doctor'}</p>
                <p className="text-xs text-slate-500">{new Date(a.date).toLocaleDateString()} {a.time}</p>
              </div>
            ))}
            {!appointments.length && <p className="text-sm text-slate-600">No recent appointments.</p>}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!error && (
        <div className="text-xs text-slate-500">System health: {summary?.systemHealthStatus || 'n/a'}</div>
      )}
    </div>
  );
};

export default AdminDashboard;
