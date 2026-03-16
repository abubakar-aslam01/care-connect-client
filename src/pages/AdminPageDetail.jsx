import { useMemo } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { findPage, getPages } from '../utils/pagesStore.js';

const AdminPageDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const page = useMemo(() => {
    return location.state?.page || findPage(id);
  }, [id, location.state]);

  if (!page) {
    return (
      <div className="space-y-4">
        <div className="card">
          <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
          <p className="text-sm text-slate-600">This page does not exist or was removed.</p>
          <button
            className="mt-3 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            onClick={() => navigate('/admin/pages')}
          >
            Back to pages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Internal page</p>
            <h1 className="text-2xl font-bold text-slate-900">{page.title}</h1>
            <p className="text-xs text-slate-500 mt-1">{page.path}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {page.audience || 'All teams'}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-700">{page.summary || 'No summary provided.'}</p>
      </div>

      <div className="card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Details</h2>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {page.body || 'No additional details yet.'}
        </p>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/admin/pages"
            className="inline-flex items-center rounded-lg border border-primary/30 px-4 py-2 font-semibold text-primary hover:bg-primary/10"
          >
            Back to list
          </Link>
          <a
            href={page.path}
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Preview path
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminPageDetail;
