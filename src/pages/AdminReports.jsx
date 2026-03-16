import { useEffect, useMemo, useState } from 'react';
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
import { adminProfileService } from '../services/adminProfile.js';
import Loader from '../components/Loader.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminReports = () => {
  const [financial, setFinancial] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: f }, { data: s }] = await Promise.all([
        adminProfileService.getFinancial(),
        adminProfileService.getSummary()
      ]);
      setFinancial(f?.data);
      setSummary(s?.data);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const monthlyChart = useMemo(() => {
    const labels = financial?.monthlyRevenueStats?.map((m) => m.month) || [];
    const data = financial?.monthlyRevenueStats?.map((m) => m.total) || [];
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          backgroundColor: 'rgba(16, 185, 129, 0.65)',
          borderRadius: 6
        }
      ]
    };
  }, [financial]);

  if (loading) return <div className="card"><Loader /></div>;
  if (error) return <div className="card text-sm text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Total Users</p><p className="text-2xl font-semibold">{summary?.totalUsers || 0}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Total Revenue</p><p className="text-2xl font-semibold">${((financial?.totalConsultationRevenue || 0) + (financial?.pharmacyRevenue || 0)).toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Appointments</p><p className="text-2xl font-semibold">{summary?.totalAppointments || 0}</p></div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Monthly revenue</h2>
        </div>
        <div className="mt-4 h-80">
          <Bar data={monthlyChart} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
