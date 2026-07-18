import { useEffect, useMemo } from 'react';
import { Check, Inbox, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { approveLeaveThunk, rejectLeaveThunk, fetchAllLeave } from '@/redux/leaveSlice';
import { fetchEmployees } from '@/redux/authSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatShortDate, getInitials } from '@/utils/utility';
import { showToast } from '@/utils/toast';
import type { LeaveStatus } from '@/types';

const STATUS_META: Record<LeaveStatus, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  pending: { label: 'Pending', variant: 'warning' },
};

export default function AdminRequests() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((state) => state.leave.requests);
  const employees = useAppSelector((state) => state.auth.employees);

  // Saari requests + employee list (naam/avatar dikhane ke liye) backend se laao.
  useEffect(() => {
    dispatch(fetchAllLeave());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const sorted = useMemo(() => {
    return [...requests].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [requests]);

  // Approve karte hi backend un dates ki attendance bhi "on-leave" mark kar deta hai.
  const handleApprove = async (id: string) => {
    const result = await dispatch(approveLeaveThunk(id));
    if (approveLeaveThunk.rejected.match(result)) {
      showToast.error('Could not approve request.');
    } else {
      showToast.success('Request approved.');
    }
  };

  const handleReject = async (id: string) => {
    const result = await dispatch(rejectLeaveThunk(id));
    if (rejectLeaveThunk.rejected.match(result)) {
      showToast.error('Could not reject request.');
    } else {
      showToast.info('Request rejected.');
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Leave Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review and respond to time off requests from employees.</p>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No leave requests yet</p>
            <p className="text-xs text-muted-foreground">Requests sent by employees will show up here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((request) => {
            const employee = employees.find((e) => e.id === request.employeeId);
            const meta = STATUS_META[request.status];
            return (
              <Card key={request.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs" style={{ backgroundColor: employee?.avatarColor }}>
                        {employee ? getInitials(employee.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-foreground">{employee?.name ?? 'Unknown employee'}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                        {request.dates
                          .slice()
                          .sort()
                          .map((d) => formatShortDate(d))
                          .join(', ')}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{request.reason || 'No reason given'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleReject(request.id)}>
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
