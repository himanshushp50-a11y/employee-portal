import { CalendarX2, Clock3 } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { cancelRequest } from '@/redux/leaveSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/utils/utility';
import type { LeaveRequest, LeaveStatus } from '@/types';

const STATUS_META: Record<LeaveStatus, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  pending: { label: 'Pending', variant: 'warning' },
};

export function LeaveRequestList({ requests }: { requests: LeaveRequest[] }) {
  const dispatch = useAppDispatch();

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
          <CalendarX2 className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No time off requests yet</p>
          <p className="text-xs text-muted-foreground">Select dates from the calendar to send a request.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((request) => {
        const meta = STATUS_META[request.status];
        return (
          <Card key={request.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-foreground">
                  {request.dates
                    .slice()
                    .sort()
                    .map((d) => formatShortDate(d))
                    .join(', ')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{request.reason || 'No reason given'}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground/70">
                  <Clock3 className="h-3 w-3" />
                  Submitted on {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(request.createdAt))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={meta.variant}>{meta.label}</Badge>
                {request.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(cancelRequest({ id: request.id }))}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
