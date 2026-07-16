import { LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { logoutUser } from '@/redux/authSlice';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const dispatch = useAppDispatch();
  const employee = useCurrentEmployee();

  if (!employee) return null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and app settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your basic account details.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
            <User className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-semibold text-foreground">{employee.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
            <Mail className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-semibold text-foreground">{employee.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Designation</p>
              <p className="text-sm font-semibold text-foreground">{employee.role}</p>
            </div>
          </div>
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

      <p className="text-center text-xs text-muted-foreground">Kuberya AI Solutions · Attendance Portal v1.0</p>
    </div>
  );
}
