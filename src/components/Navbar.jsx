import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorNotificationsService } from '../services/doctorNotifications.js';
import { patientNotificationsService } from '../services/patientNotifications.js';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (user?.role === 'doctor') {
          const { data } = await doctorNotificationsService.list({ limit: 5 });
          setUnread(data?.data?.pagination?.unreadCount || 0);
          setNotifications(data?.data?.notifications || []);
        } else if (user?.role === 'patient') {
          const { data } = await patientNotificationsService.list({ limit: 5 });
          setUnread(data?.data?.pagination?.unreadCount || 0);
          setNotifications(data?.data?.notifications || []);
        } else {
          setUnread(0);
          setNotifications([]);
        }
      } catch {
        setUnread(0);
        setNotifications([]);
      }
    };
    fetchUnread();
  }, [user]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 shadow-sm lg:px-6">
      <div className="flex items-center gap-3">
        <button
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h1 className="text-lg font-semibold text-slate-900">Care Connect Pro</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Online</span>
        </div>
        {(user?.role === 'doctor' || user?.role === 'patient') && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="relative rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => setDropdownOpen((p) => !p)}
              aria-label="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-800 border-b border-slate-100">
                  <span>Notifications</span>
                  <button
                    className="text-xs font-semibold text-primary hover:underline"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (user?.role === 'patient') navigate('/patient/profile?tab=Notifications');
                      if (user?.role === 'doctor') navigate('/doctor/notifications');
                    }}
                  >
                    Open center
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length ? (
                    notifications.map((n) => (
                      <div key={n._id} className="px-3 py-2 text-sm border-b border-slate-100 last:border-0">
                        <p className="font-semibold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-600">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="px-3 py-3 text-xs text-slate-500">No notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'role'}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold uppercase">
            {(user?.name || 'CC').slice(0, 2)}
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
