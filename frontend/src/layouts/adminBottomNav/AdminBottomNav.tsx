import { NavLink } from 'react-router-dom';
import { ClipboardList, Inbox, CalendarDays, Settings } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { cn } from '@/utils/cn';

export function AdminBottomNav() {
  const pendingCount = useAppSelector(
    (state) => state.leave.requests.filter((r) => r.status === 'pending').length
  );

  const navItems = [
    { to: '/admin', label: 'Attendance', icon: ClipboardList, end: true, badge: 0 },
    { to: '/admin/requests', label: 'Requests', icon: Inbox, end: false, badge: pendingCount },
    { to: '/admin/time-off', label: 'Time Off', icon: CalendarDays, end: false, badge: 0 },
    { to: '/admin/settings', label: 'Settings', icon: Settings, end: false, badge: 0 },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-sm lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {badge > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {badge}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
