const Loader = ({ label = 'Loading...' }) => (
  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
    <span className="h-3 w-3 animate-ping rounded-full bg-primary" />
    {label}
  </div>
);

export default Loader;
