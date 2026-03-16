import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Settings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '' });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '' });
  }, [user]);

  return (
    <div className="max-w-xl space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-slate-500">Basic account info (read-only demo).</p>
        <form className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50"
              value={form.name}
              disabled
              readOnly
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50"
              type="email"
              value={form.email}
              disabled
              readOnly
            />
          </label>
          <p className="text-xs text-slate-500">Editing and persistence can be wired to backend later.</p>
        </form>
      </div>
    </div>
  );
};

export default Settings;
