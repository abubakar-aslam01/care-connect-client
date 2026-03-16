import { useEffect, useMemo, useState } from 'react';
import { doctorService } from '../services/doctors.js';
import { departmentService } from '../services/departments.js';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  department: '',
  consultationFee: '',
  profileImage: '',
  bio: ''
};

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, editId: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const fetchDepartments = async () => {
    try {
      const { data } = await departmentService.list();
      setDepartments(data?.data?.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async (pageParam = page) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageParam, limit, search: search || undefined, department: departmentFilter || undefined };
      const { data } = await doctorService.list(params);
      const list = data?.data?.doctors || [];
      setDoctors(list);
      setTotalPages(Math.max(1, data?.data?.pagination?.totalPages || 1));
    } catch (err) {
      setError(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, departmentFilter]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, editId: null });
  };

  const openEdit = (doctor) => {
    setForm({
      name: doctor.name || '',
      email: doctor.email || '',
      password: '',
      specialization: doctor.specialization || '',
      department: doctor.department?._id || doctor.department || '',
      consultationFee: doctor.consultationFee ?? '',
      profileImage: doctor.profileImage || '',
      bio: doctor.bio || ''
    });
    setModal({ open: true, editId: doctor._id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal.editId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await doctorService.update(modal.editId, { ...payload, role: 'doctor' });
      } else {
        await doctorService.create({ ...form, role: 'doctor' });
      }
      setModal({ open: false, editId: null });
      setForm(emptyForm);
      fetchDoctors(page);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm.id) return;
    setSaving(true);
    setError('');
    try {
      await doctorService.remove(confirm.id);
      setConfirm({ open: false, id: null });
      fetchDoctors(page);
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const departmentOptions = useMemo(() => departments.map((d) => ({ value: d._id, label: d.name })), [departments]);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Doctors</h2>
            <p className="text-sm text-slate-500">Manage doctors, edit details, and control availability.</p>
          </div>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-48 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search name or specialization"
            />
            <select
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
              className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All departments</option>
              {departmentOptions.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <button
              onClick={openCreate}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            >
              Add doctor
            </button>
          </div>
        </div>
        {loading && <div className="mt-3"><Loader /></div>}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Image</th>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Specialization</th>
                <th className="px-3 py-2 font-semibold">Department</th>
                <th className="px-3 py-2 font-semibold">Fee</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id} className="border-b border-slate-100">
                  <td className="px-3 py-2">
                    {doc.profileImage ? (
                      <img src={doc.profileImage} alt={doc.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                        {doc.name?.slice(0, 2)?.toUpperCase() || 'DR'}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-900">{doc.name}</td>
                  <td className="px-3 py-2 text-slate-700">{doc.specialization || '—'}</td>
                  <td className="px-3 py-2 text-slate-700">{doc.department?.name || doc.department || '—'}</td>
                  <td className="px-3 py-2 text-slate-700">{doc.consultationFee != null ? `$${doc.consultationFee}` : '—'}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      className="text-sm font-semibold text-primary hover:text-primary/80"
                      onClick={() => openEdit(doc)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                      onClick={() => setConfirm({ open: true, id: doc._id })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!doctors.length && !loading && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={6}>No doctors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal
        open={modal.open}
        title={modal.editId ? 'Edit doctor' : 'Add doctor'}
        onClose={() => setModal({ open: false, editId: null })}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => setModal({ open: false, editId: null })}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required={!modal.editId}
                disabled={!!modal.editId}
              />
            </div>
          </div>

          {!modal.editId && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Specialization</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.specialization}
                onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Department</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              >
                <option value="">Select department</option>
                {departmentOptions.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Consultation Fee</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.consultationFee}
                onChange={(e) => setForm((p) => ({ ...p, consultationFee: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Profile Image URL</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.profileImage}
                onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Bio</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Short bio"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={confirm.open}
        title="Delete doctor"
        onClose={() => setConfirm({ open: false, id: null })}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => setConfirm({ open: false, id: null })}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-70"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">Are you sure you want to delete this doctor? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default AdminDoctors;
