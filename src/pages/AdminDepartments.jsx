import { useEffect, useMemo, useState } from 'react';
import { departmentService } from '../services/departments.js';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const isEditing = useMemo(() => Boolean(editId), [editId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await departmentService.list();
      setDepartments(data?.data?.departments || []);
    } catch (err) {
      setError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError('Name is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (isEditing) {
        await departmentService.update(editId, form);
      } else {
        await departmentService.create(form);
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (dept) => {
    setEditId(dept._id);
    setForm({ name: dept.name, description: dept.description || '' });
  };

  const confirmDelete = (id) => setConfirm({ open: true, id });

  const handleDelete = async () => {
    if (!confirm.id) return;
    setSubmitting(true);
    try {
      await departmentService.remove(confirm.id);
      setConfirm({ open: false, id: null });
      fetchData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{isEditing ? 'Edit department' : 'Add department'}</h2>
            <p className="text-sm text-slate-500">Manage organizational departments.</p>
          </div>
          {loading && <Loader />}
        </div>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Cardiology"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Heart and vascular care"
            />
          </div>
          {error && <p className="md:col-span-2 text-sm text-red-500">{error}</p>}
          <div className="md:col-span-2 flex justify-end gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (isEditing ? 'Saving...' : 'Adding...') : isEditing ? 'Save changes' : 'Add department'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Departments</h2>
          {loading && <Loader />}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-semibold text-slate-900">{dept.name}</td>
                  <td className="px-3 py-2 text-slate-600">{dept.description || '—'}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      className="text-sm font-semibold text-primary hover:text-primary/80"
                      onClick={() => startEdit(dept)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                      onClick={() => confirmDelete(dept._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!departments.length && !loading && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={3}>
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={confirm.open}
        title="Delete department"
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
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">This action cannot be undone. Are you sure you want to delete this department?</p>
      </Modal>
    </div>
  );
};

export default AdminDepartments;
