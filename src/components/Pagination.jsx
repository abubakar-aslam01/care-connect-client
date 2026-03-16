const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 text-sm mt-4">
      <button
        className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>
      <span className="text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button
        className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
