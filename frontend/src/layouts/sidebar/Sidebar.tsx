import { NavLink } from 'react-router-dom';
import { LayoutGrid, ClipboardList, CalendarDays, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/my-logs', label: 'My Logs', icon: ClipboardList, end: false },
  { to: '/time-off', label: 'Time Off', icon: CalendarDays, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-1 px-3 py-6 lg:flex">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
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
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
