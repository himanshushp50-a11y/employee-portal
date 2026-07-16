import { useAppSelector } from '@/redux/hooks';

export function useCurrentEmployee() {
  const { employees, currentUserId } = useAppSelector((state) => state.auth);
  return employees.find((e) => e.id === currentUserId) ?? null;
}
