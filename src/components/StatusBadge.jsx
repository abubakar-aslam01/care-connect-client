const variants = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200'
};

const StatusBadge = ({ status = 'pending' }) => {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${variants[status] || variants.pending}`}>
      <span className="h-2 w-2 rounded-full bg-current/60 mr-2" />
      {status}
    </span>
  );
};

export default StatusBadge;
