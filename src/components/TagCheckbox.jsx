const TagCheckbox = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${checked ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600 hover:border-primary/50'}`}
  >
    {label}
  </button>
);

export default TagCheckbox;
