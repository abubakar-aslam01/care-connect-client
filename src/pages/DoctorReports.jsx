import { useEffect, useMemo, useState } from 'react';
import { doctorProfileService } from '../services/doctorProfile.js';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DoctorReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await doctorProfileService.getReports();
      setData(data?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const chartData = useMemo(() => {
    const labels = data?.monthlyStats?.map((m) => m.month) || [];
    const counts = data?.monthlyStats?.map((m) => m.count) || [];
    return {
      labels,
      datasets: [
        {
          label: 'Appointments',
          data: counts,
          backgroundColor: 'rgba(79, 70, 229, 0.65)',
          borderRadius: 6
        }
      ]
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }),
    []
  );

  if (loading) return <div className="card"><Loader /></div>;
  if (error) return <div className="card text-sm text-red-500">{error}</div>;
  if (!data) return <div className="card text-sm text-slate-600">No report data.</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Total Appointments</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{data.totalAppointments ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{data.approvedCount ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{data.rejectedCount ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Total Earnings</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">${data.totalEarnings?.toFixed?.(2) || 0}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Monthly appointments</h2>
            <p className="text-sm text-slate-600">Appointments grouped by month.</p>
          </div>
        </div>
        <div className="mt-4 h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DoctorReports;
