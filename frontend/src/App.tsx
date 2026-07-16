import { useEffect } from 'react';
import { Toaster } from 'sonner';
import Router from '@/components/Router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { ensureSeedAccounts } from '@/redux/authSlice';
import { seedDemoRecords } from '@/redux/attendanceSlice';
import { generateDemoAttendance } from '@/utils/seedData';

export default function App() {
  const dispatch = useAppDispatch();
  const { currentUserId } = useAppSelector((state) => state.auth);
  const seeded = useAppSelector((state) => state.attendance.seeded);

  useEffect(() => {
    dispatch(ensureSeedAccounts());
  }, [dispatch]);

  useEffect(() => {
    if (currentUserId === 'emp-1' && !seeded) {
      dispatch(seedDemoRecords(generateDemoAttendance('emp-1', new Date())));
    }
  }, [currentUserId, seeded, dispatch]);

  return (
    <>
      <Router />
      <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 4000 }} />
    </>
  );
}
