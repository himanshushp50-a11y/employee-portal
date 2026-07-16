import { NavLink } from 'react-router-dom';
import { ClipboardList, Inbox, CalendarDays, Settings } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { cn } from '@/utils/cn';

export function AdminSidebar() {
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
    <aside className="hidden w-56 shrink-0 flex-col gap-1 px-3 py-6 lg:flex">
      {navItems.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )
          }
        >
          <span className="relative">
            <Icon className="h-5 w-5" />
            {badge > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {badge}
              </span>
            )}
          </span>
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
