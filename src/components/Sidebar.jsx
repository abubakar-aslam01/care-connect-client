import { NavLink } from 'react-router-dom';

const Sidebar = ({ open, onClose, items = [] }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-slate-900/40 transition-opacity lg:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 shadow-sm transform transition-transform duration-200 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
          <div className="text-lg font-semibold text-primary">Care Connect</div>
          <button className="lg:hidden text-slate-500" onClick={onClose} aria-label="Close sidebar">
            ×
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
          {!items.length && <p className="text-sm text-slate-500">No links</p>}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
