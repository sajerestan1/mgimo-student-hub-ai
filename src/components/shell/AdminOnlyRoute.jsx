import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

// Administration surface. The routing guard is a convenience only: the server
// function behind every action re-verifies the administrator role itself.
export default function AdminOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children || <Outlet />;
}