const PharmacyActivityList = ({ items }) => {
  if (!items?.length) return <p className="text-sm text-slate-600">No pharmacy activity yet.</p>;

  return (
    <div className="space-y-3">
      {items.map((log) => (
        <div key={log._id || log.id} className="rounded-lg border border-slate-200 p-3">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-slate-900">{log.actionLabel || log.action}</span>
            <span className="text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-600">{log.description}</p>
          <p className="text-[11px] text-slate-500">{log.user || 'Admin'} • {log.role || 'admin'}</p>
        </div>
      ))}
    </div>
  );
};

export default PharmacyActivityList;
