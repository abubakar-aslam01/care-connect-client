import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const navigate = useNavigate();
  const { register, authLoading, getDashboardPath } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const nextErrors = {};
    if (!form.name) nextErrors.name = 'Name is required';
    if (!form.email) nextErrors.email = 'Email is required';
    if (!form.password) nextErrors.password = 'Password is required';
    if (form.password && form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords must match';
    }
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const { user } = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone
      });
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err) {
      setSubmitError(err.message || 'Failed to register');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=2000&q=80"
          alt="Care team collaborating"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/70 to-slate-900/60" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <h1 className="text-4xl font-extrabold uppercase leading-tight tracking-[0.08em] text-white drop-shadow-lg sm:text-5xl">
            Care Connect
          </h1>
          <p className="text-sm text-slate-200 sm:text-base">
            Create your account to manage care, scheduling, and hospital inventory in one place.
          </p>
        </div>

        <div className="flex w-full max-w-4xl justify-center px-2">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg lg:p-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Create account</p>
                <h2 className="text-2xl font-bold text-slate-900">Join Care Connect</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Inventory + care</span>
            </div>
            <p className="mt-3 text-sm text-slate-700">Create an account for your role to access patients, schedules, and inventory in one place.</p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-800">Full name</label>
                  <input
                    className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.name ? 'border-red-400' : 'border-slate-300'}`}
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Jane Doe"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800">Phone number</label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 555 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800">Email address</label>
                <input
                  type="email"
                  className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your.name@hospital.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-800">Create password</label>
                  <input
                    type="password"
                    className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.password ? 'border-red-400' : 'border-slate-300'}`}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="At least 8 characters"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800">Confirm password</label>
                  <input
                    type="password"
                    className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.confirmPassword ? 'border-red-400' : 'border-slate-300'}`}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800">Role</label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                </select>
              </div>

              {submitError && <p className="text-sm text-red-500">{submitError}</p>}

              <button
                type="submit"
                disabled={authLoading}
                className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {authLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-lg border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Already have an account? Sign in
              </Link>
              <p className="text-xs text-slate-500 text-center">All users get secure access to care and inventory workflows.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
