import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, XCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchMyAttendance } from '@/redux/attendanceSlice';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toDateKey, formatFullDate, formatTime, formatDuration, minutesBetween } from '@/utils/utility';
import type { AttendanceStatus } from '@/types';

const STATUS_META: Record<AttendanceStatus, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  present: { label: 'Present', variant: 'success' },
  absent: { label: 'Absent', variant: 'destructive' },
  'on-leave': { label: 'On Leave', variant: 'warning' },
};

export default function MyLogs() {
  const dispatch = useAppDispatch();
  const employee = useCurrentEmployee();
  const records = useAppSelector((state) => state.attendance.records);
  const [month, setMonth] = useState(() => toDateKey(new Date()).slice(0, 7));

  useEffect(() => {
    dispatch(fetchMyAttendance());
  }, [dispatch]);

  const filtered = useMemo(() => {
    if (!employee) return [];
    return records
      .filter((r) => r.employeeId === employee.id && r.date.startsWith(month))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [records, employee, month]);

  const summary = useMemo(() => {
    const present = filtered.filter((r) => r.status === 'present').length;
    const absent = filtered.filter((r) => r.status === 'absent').length;
    const onLeave = filtered.filter((r) => r.status === 'on-leave').length;
    const totalMinutes = filtered.reduce(
      (sum, r) => (r.clockIn && r.clockOut ? sum + minutesBetween(r.clockIn, r.clockOut) : sum),
      0
    );
    return { present, absent, onLeave, totalMinutes };
  }, [filtered]);

  if (!employee) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your past attendance history is here.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="month" className="text-xs font-semibold text-muted-foreground">
            Month
          </label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-10 rounded-xl border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-foreground">{summary.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-foreground">{summary.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-foreground">{summary.onLeave}</p>
            <p className="text-xs text-muted-foreground">Leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-foreground">{Math.round(summary.totalMinutes / 60)}h</p>
            <p className="text-xs text-muted-foreground">Total Hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <CalendarClock className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No logs for this month</p>
              <p className="text-xs text-muted-foreground">Try selecting a different month.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Desktop table header */}
              <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                <span>Date</span>
                <span>Clock In</span>
                <span>Clock Out</span>
                <span>Hours</span>
                <span className="text-right">Status</span>
              </div>
              {filtered.map((record) => {
                const meta = STATUS_META[record.status];
                const hours =
                  record.clockIn && record.clockOut
                    ? formatDuration(minutesBetween(record.clockIn, record.clockOut))
                    : '—';
                return (
                  <div
                    key={record.id}
                    className="grid grid-cols-2 gap-2 px-5 py-4 text-sm sm:grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] sm:items-center"
                  >
                    <span className="col-span-2 font-semibold text-foreground sm:col-span-1">
                      {formatFullDate(record.date)}
                    </span>
                    <span className="text-muted-foreground">
                      <span className="mr-1 text-xs font-semibold uppercase text-muted-foreground/70 sm:hidden">In:</span>
                      {formatTime(record.clockIn)}
                    </span>
                    <span className="text-muted-foreground">
                      <span className="mr-1 text-xs font-semibold uppercase text-muted-foreground/70 sm:hidden">Out:</span>
                      {formatTime(record.clockOut)}
                    </span>
                    <span className="text-muted-foreground">{hours}</span>
                    <span className="sm:text-right">
                      <Badge variant={meta.variant}>
                        {record.status === 'present' ? (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        ) : record.status === 'absent' ? (
                          <XCircle className="mr-1 h-3 w-3" />
                        ) : null}
                        {meta.label}
                      </Badge>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
