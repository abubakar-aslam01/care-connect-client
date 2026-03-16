import { useEffect, useState } from 'react';
import { doctorProfileService } from '../services/doctorProfile.js';
import Loader from '../components/Loader.jsx';

const DoctorDepartment = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDepartment = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await doctorProfileService.getDepartment();
      setData(data?.data?.department || null);
    } catch (err) {
      setError(err.message || 'Failed to load department');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, []);

  if (loading) return <div className="card"><Loader /></div>;
  if (error) return <div className="card text-sm text-red-500">{error}</div>;
  if (!data) return <div className="card text-sm text-slate-600">No department assigned.</div>;

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-xl font-semibold text-slate-900">My Department</h1>
        <p className="text-sm text-slate-600">Department details and stats.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-2">
          <p className="text-sm text-slate-500">Department</p>
          <p className="text-2xl font-semibold text-slate-900">{data.name}</p>
          <p className="text-sm text-slate-600">{data.description || 'No description provided.'}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-slate-500">Head of Department</p>
          <p className="text-lg font-semibold text-slate-900">{data.head?.name || 'Not assigned'}</p>
          <p className="text-sm text-slate-600">{data.head?.email || ''}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="text-sm text-slate-500">Total Doctors</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{data.totalDoctors ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Total Appointments</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{data.totalAppointments ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDepartment;
