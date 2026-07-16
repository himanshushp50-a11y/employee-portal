import { Outlet } from 'react-router-dom';
import { Header } from './header/Header';
import { Sidebar } from './sidebar/Sidebar';
import { BottomNav } from './bottomnav/BottomNav';

export default function Layout() {
  return (
    <div className="office-backdrop min-h-screen">
      <Header />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
