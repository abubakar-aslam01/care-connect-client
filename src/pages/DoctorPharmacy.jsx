import { useEffect, useMemo, useState } from 'react';
import { doctorPharmacyService } from '../services/doctorPharmacy.js';
import Loader from '../components/Loader.jsx';
import { appointmentService } from '../services/appointments.js';

const DoctorPharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cart, setCart] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [notes, setNotes] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [appointments, setAppointments] = useState([]);

  const fetchMedicines = async (pageParam = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await doctorPharmacyService.list({ search, page: pageParam, limit: 10 });
      setMedicines(data?.data?.medicines || []);
      setTotalPages(data?.data?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => {
    // Load approved appointments to quickly link prescriptions
    (async () => {
      try {
        const { data } = await appointmentService.doctorList({ status: 'approved', limit: 50 });
        setAppointments(data?.data?.appointments || []);
      } catch (err) {
        /* ignore doctor appointment load errors in pharmacy */
      }
    })();
  }, []);

  const addToCart = (med) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === med._id);
      if (existing) {
        return prev.map((i) => (i._id === med._id ? { ...i, quantity: Math.min(i.quantity + 1, med.stock) } : i));
      }
      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const updateQuantity = (id, qty, stock) => {
    setCart((prev) => prev.map((i) => (i._id === id ? { ...i, quantity: Math.max(1, Math.min(qty, stock)) } : i)));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i._id !== id));

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const handleSubmit = async () => {
    if (!cart.length) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        medicines: cart.map((c) => ({ medicineId: c._id, quantity: c.quantity })),
        patientId: patientId || undefined,
        patientName: patientName || undefined,
        notes: notes || undefined,
        appointmentId: appointmentId || undefined
      };
      await doctorPharmacyService.createPrescription(payload);
      setCart([]);
      setMessage('Prescription created and stock updated');
      fetchMedicines(page);
    } catch (err) {
      setError(err.message || 'Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Pharmacy</h1>
            <p className="text-sm text-slate-600">Search medicines and add to a prescription.</p>
          </div>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 md:w-64"
            placeholder="Search medicines"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {loading && <div className="mt-3"><Loader /></div>}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {medicines.map((med) => (
            <div key={med._id} className="card border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{med.name}</p>
                  <p className="text-xs text-slate-600">{med.description || 'No description'}</p>
                  <p className="text-xs text-slate-500">Stock: {med.stock}</p>
                </div>
                <button
                  onClick={() => addToCart(med)}
                  disabled={med.stock <= 0}
                  className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
          {!medicines.length && !loading && (
            <p className="text-sm text-slate-600">No medicines found.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Prescription cart</h2>
            <p className="text-sm text-slate-600">Total items: {totalItems}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {cart.map((item) => (
            <div key={item._id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-600">Stock: {item.stock}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item._id, Number(e.target.value), item.stock)}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {!cart.length && <p className="text-sm text-slate-600">No medicines in cart.</p>}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Patient name (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Link to appointment/patient</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={appointmentId}
              onChange={(e) => {
                const selectedApptId = e.target.value;
                setAppointmentId(selectedApptId);
                const appt = appointments.find((a) => a._id === selectedApptId);
                if (appt) {
                  setPatientId(appt.patientId?._id || '');
                  setPatientName(appt.patientId?.name || '');
                }
              }}
            >
              <option value="">Select approved appointment</option>
              {appointments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.patientId?.name || 'Patient'} — {new Date(a.date).toLocaleDateString()} {a.time}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">Choosing an appointment links the prescription to that patient.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Notes (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Prescription notes"
            />
          </div>
        </div>

        {message && <p className="mt-2 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!cart.length || saving}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
          >
            {saving ? 'Submitting...' : 'Generate prescription'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPharmacy;
