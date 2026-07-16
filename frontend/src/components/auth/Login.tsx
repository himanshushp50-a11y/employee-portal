import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login, signup, clearAuthError } from '@/redux/authSlice';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/utils/cn';

type LoginRole = 'employee' | 'admin';

export default function Login() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, error } = useAppSelector((state) => state.auth);
  const employee = useCurrentEmployee();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginRole, setLoginRole] = useState<LoginRole>('employee');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated) {
    return <Navigate to={employee?.isAdmin ? '/admin' : '/'} replace />;
  }

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    dispatch(clearAuthError());
  };

  const switchLoginRole = (next: LoginRole) => {
    setLoginRole(next);
    dispatch(clearAuthError());
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      dispatch(login({ email, password, expectedRole: loginRole }));
    } else {
      dispatch(signup({ name, email, password, role }));
    }
  };

  return (
    <div className="office-backdrop flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/95 p-8 shadow-card backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-4 text-xl font-bold text-foreground">Kuberya AI Solutions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Employee Attendance Portal</p>
        </div>

        {mode === 'login' ? (
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-secondary p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => switchLoginRole('employee')}
              className={cn(
                'rounded-lg py-2 transition-colors',
                loginRole === 'employee' ? 'bg-white shadow-soft text-primary' : 'text-muted-foreground'
              )}
            >
              Login as Employee
            </button>
            <button
              type="button"
              onClick={() => switchLoginRole('admin')}
              className={cn(
                'rounded-lg py-2 transition-colors',
                loginRole === 'admin' ? 'bg-white shadow-soft text-primary' : 'text-muted-foreground'
              )}
            >
              Login as Admin
            </button>
          </div>
        ) : (
          <p className="mt-6 text-center text-lg font-bold text-foreground">Create Employee Account</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={mode === 'login' && loginRole === 'admin' ? 'admin@kuberya.ai' : 'you@kuberya.ai'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Designation</Label>
              <Input
                id="role"
                placeholder="e.g. Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" size="lg" className="mt-2 w-full">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              New employee?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="font-semibold text-primary hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-semibold text-primary hover:underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
