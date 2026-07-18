import { useAppSelector } from '@/redux/hooks';

// Abhi logged-in user (backend "/me" / login se aaya hua). Employee ya admin dono ke liye.
export function useCurrentEmployee() {
  return useAppSelector((state) => state.auth.currentUser);
}
