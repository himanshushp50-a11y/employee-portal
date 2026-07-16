import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';

export default function RequireRole({ role }: { role: 'admin' | 'employee' }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const employee = useCurrentEmployee();

  if (!isAuthenticated || !employee) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin' && !employee.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (role === 'employee' && employee.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
