import { LogOut } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { logoutUser } from '@/redux/authSlice';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { getGreeting, getInitials } from '@/utils/utility';

export function Header() {
  const dispatch = useAppDispatch();
  const employee = useCurrentEmployee();

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <p className="flex items-center gap-2 text-base font-bold leading-tight text-foreground sm:text-lg">
              Kuberya Ai Solutions
              {employee?.isAdmin && <Badge variant="default">Admin</Badge>}
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {getGreeting(new Date())}, {employee?.name.split(' ')[0] ?? ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback style={{ backgroundColor: employee?.avatarColor }}>
              {employee ? getInitials(employee.name) : ''}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => dispatch(logoutUser())}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            aria-label="Logout"
            onClick={() => dispatch(logoutUser())}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
