import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import { doctorPharmacyService } from '../services/doctorPharmacy.js';
import { adminPharmacyService } from '../services/adminPharmacy.js';
import { adminPharmacyActivityService } from '../services/adminPharmacyActivity.js';
import PharmacyActivityList from '../components/PharmacyActivityList.jsx';
import { toast } from 'sonner';

const AdminPharmacy = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', stock: 0, price: 0, unit: 'unit' });
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await doctorPharmacyService.list({ page: 1, limit: 50 });
      setItems(data?.data?.medicines || []);
      const act = await adminPharmacyActivityService.list({ limit: 10 });
      setActivity(act?.data?.data?.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminPharmacyService.create({
        name: form.name,
        description: form.description,
        stock: Number(form.stock) || 0,
        price: Number(form.price) || 0,
        unit: form.unit
      });
      toast.success('Medicine added');
      setForm({ name: '', description: '', stock: 0, price: 0, unit: 'unit' });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card"><Loader /></div>;
  if (error) return <div className="card text-sm text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-xl font-semibold text-slate-900">Pharmacy Inventory</h1>
        <p className="text-sm text-slate-600">View and add medicines to inventory.</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">Add medicine</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={handleCreate}>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Stock</label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.stock}
              onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Unit</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.unit}
              onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-70"
            >
              {saving ? 'Adding...' : 'Add medicine'}
            </button>
          </div>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2 font-semibold">Medicine</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold">Stock</th>
              <th className="px-3 py-2 font-semibold">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m._id} className="border-b border-slate-100">
                <td className="px-3 py-2 font-semibold text-slate-900">{m.name}</td>
                <td className="px-3 py-2 text-slate-700">{m.description || '—'}</td>
                <td className="px-3 py-2 text-slate-700">{m.stock}</td>
                <td className="px-3 py-2 text-slate-700">${m.price || 0}</td>
              </tr>
            ))}
            {!items.length && <tr><td className="px-3 py-4 text-center text-slate-500" colSpan={4}>No medicines found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent pharmacy activity</h2>
          <span className="text-xs text-slate-500">Last 10 actions</span>
        </div>
        <div className="mt-3">
          <PharmacyActivityList
            items={
              activity.length
                ? activity
                : [
                    { id: 'seed-a', actionLabel: 'Added medicine', description: 'Admin added Amoxicillin 500mg', role: 'admin', user: 'Admin', createdAt: new Date() },
                    { id: 'seed-b', actionLabel: 'Updated stock', description: 'Adjusted stock for Paracetamol 650mg', role: 'admin', user: 'Admin', createdAt: new Date(Date.now() - 3600 * 1000) },
                    { id: 'seed-c', actionLabel: 'Deleted medicine', description: 'Removed expired Lot #AX23', role: 'admin', user: 'Admin', createdAt: new Date(Date.now() - 2 * 3600 * 1000) }
                  ]
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPharmacy;
