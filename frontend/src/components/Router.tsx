import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/layouts/Layout';
import AdminLayout from '@/layouts/AdminLayout';
import RequireRole from '@/components/auth/RequireRole';

const Login = lazy(() => import('@/components/auth/Login'));
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));
const MyLogs = lazy(() => import('@/components/myLogs/MyLogs'));
const TimeOff = lazy(() => import('@/components/timeOff/TimeOff'));
const Settings = lazy(() => import('@/components/settings/Settings'));
const Profile = lazy(() => import('@/components/profile/Profile'));
const Requests = lazy(() => import('@/components/requests/Requests'));
const Help = lazy(() => import('@/components/help/Help'));
const AdminAttendance = lazy(() => import('@/components/admin/AdminAttendance'));
const AdminRequests = lazy(() => import('@/components/admin/AdminRequests'));
const AdminTimeOff = lazy(() => import('@/components/admin/AdminTimeOff'));
const AdminSettings = lazy(() => import('@/components/admin/AdminSettings'));
const NoMatch = lazy(() => import('@/components/error/NoMatch'));

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export default function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RequireRole role="employee" />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/my-logs" element={<MyLogs />} />
            <Route path="/time-off" element={<TimeOff />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/help" element={<Help />} />
          </Route>
        </Route>

        <Route element={<RequireRole role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminAttendance />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/time-off" element={<AdminTimeOff />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<NoMatch />} />
      </Routes>
    </Suspense>
  );
}
