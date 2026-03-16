import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addPage, getPages } from '../utils/pagesStore.js';

const AdminPages = () => {
  const [pages, setPages] = useState(getPages());
  const [form, setForm] = useState({ title: '', path: '', summary: '', audience: '', body: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.path) return;
    const created = addPage(form);
    setPages(getPages());
    setForm({ title: '', path: '', summary: '', audience: '', body: '' });
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-xl font-semibold text-slate-900">Add Pages</h1>
        <p className="text-sm text-slate-600">Create quick internal pages (static info, SOPs, policies) for Care Connect.</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">New page</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-800">Title</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Infection Control"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800">Path / slug</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.path}
              onChange={(e) => setForm((p) => ({ ...p, path: e.target.value }))}
              placeholder="/pages/infection-control"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800">Audience</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.audience}
              onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
              placeholder="e.g., Nurses, Admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800">Summary</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.summary}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              placeholder="Short description of this page"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-800">Body (details)</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={4}
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Full content for this page"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            >
              Add page
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">Draft pages</h2>
        <div className="mt-3 divide-y divide-slate-200">
          {pages.map((page) => (
            <div key={page.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <Link to={`/admin/pages/${page.id}`} className="text-base font-semibold text-primary hover:underline">
                    {page.title}
                  </Link>
                  <p className="text-xs text-slate-500">{page.path}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {page.audience || 'All teams'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{page.summary || 'No summary yet.'}</p>
            </div>
          ))}
          {!pages.length && <p className="py-4 text-sm text-slate-500">No pages yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
