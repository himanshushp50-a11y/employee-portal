import { Outlet } from 'react-router-dom';
import { Header } from './header/Header';
import { AdminSidebar } from './adminSidebar/AdminSidebar';
import { AdminBottomNav } from './adminBottomNav/AdminBottomNav';

export default function AdminLayout() {
  return (
    <div className="office-backdrop min-h-screen">
      <Header />
      <div className="mx-auto flex max-w-7xl">
        <AdminSidebar />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
