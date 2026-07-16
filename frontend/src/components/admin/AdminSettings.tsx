import { LogOut, Mail, ShieldCheck, User, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logoutUser } from '@/redux/authSlice';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/utils/utility';

export default function AdminSettings() {
  const dispatch = useAppDispatch();
  const admin = useCurrentEmployee();
  const employees = useAppSelector((state) => state.auth.employees).filter((e) => !e.isAdmin);

  if (!admin) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your admin account and view registered employees.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your admin account details.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
            <User className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-semibold text-foreground">{admin.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
            <Mail className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-semibold text-foreground">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-semibold text-foreground">{admin.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>{employees.length} registered employee{employees.length === 1 ? '' : 's'}.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          {employees.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              No employees have signed up yet.
            </p>
          ) : (
            employees.map((employee) => (
              <div key={employee.id} className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs" style={{ backgroundColor: employee.avatarColor }}>
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{employee.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {employee.email} · {employee.role}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Log out from this device.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button variant="destructive" onClick={() => dispatch(logoutUser())}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">Kuberya AI Solutions · Admin Panel v1.0</p>
    </div>
  );
}
