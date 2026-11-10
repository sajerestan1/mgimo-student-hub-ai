import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import AccessDenied from '@/pages/AccessDenied';

// Administration surface. The routing guard is a convenience only: the server
// function behind every action re-verifies the administrator role itself.
export default function AdminOnlyRoute({ children }) {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <AccessDenied requested="Administration" detail="This page is open to administrators only." />;
  }

  return children || <Outlet />;
}