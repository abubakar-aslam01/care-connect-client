import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RoleRedirect = () => {
  const { user, loading, getDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex items-center gap-3 text-sm font-medium">
          <span className="h-3 w-3 animate-ping rounded-full bg-primary" />
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={getDashboardPath(user.role)} replace />;
};

export default RoleRedirect;
