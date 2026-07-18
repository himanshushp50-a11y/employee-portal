import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchMyLeave } from '@/redux/leaveSlice';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { LeaveRequestList } from '@/components/timeOff/LeaveRequestList';
import { Button } from '@/components/ui/button';

export default function Requests() {
  const dispatch = useAppDispatch();
  const employee = useCurrentEmployee();
  const requests = useAppSelector((state) => state.leave.requests);

  useEffect(() => {
    dispatch(fetchMyLeave());
  }, [dispatch]);

  const myRequests = useMemo(
    () => (employee ? requests.filter((r) => r.employeeId === employee.id) : []),
    [requests, employee]
  );

  if (!employee) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Status of all your time off requests.</p>
        </div>
        <Button asChild>
          <Link to="/time-off">+ New Request</Link>
        </Button>
      </div>

      <LeaveRequestList requests={myRequests} />
    </div>
  );
}
