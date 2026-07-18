import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import Router from '@/components/Router';
import { useAppDispatch } from '@/redux/hooks';
import { restoreSession } from '@/redux/authSlice';
import { getToken } from '@/api/client';

export default function App() {
  const dispatch = useAppDispatch();
  // Agar token pehle se hai to session restore hone tak wait karo, warna refresh par
  // logged-in user ek pal ke liye login screen dekhega. Token na ho to seedha ready.
  const [ready, setReady] = useState(() => !getToken());

  useEffect(() => {
    if (getToken()) {
      dispatch(restoreSession()).finally(() => setReady(true));
    }
  }, [dispatch]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Router />
      <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 4000 }} />
    </>
  );
}
