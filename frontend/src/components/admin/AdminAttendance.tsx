import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, CalendarClock, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchEmployees } from '@/redux/authSlice';
import { fetchAttendanceForDate } from '@/redux/attendanceSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toDateKey, formatFullDate, formatTime, formatDuration, minutesBetween, getInitials } from '@/utils/utility';
import type { AttendanceStatus } from '@/types';

type DisplayStatus = AttendanceStatus | 'not-clocked-in' | 'upcoming';

const STATUS_META: Record<DisplayStatus, { label: string; variant: 'success' | 'destructive' | 'warning' | 'muted' }> = {
  present: { label: 'Present', variant: 'success' },
  absent: { label: 'Absent', variant: 'destructive' },
  'on-leave': { label: 'On Leave', variant: 'warning' },
  'not-clocked-in': { label: 'Not clocked in yet', variant: 'muted' },
  upcoming: { label: 'Upcoming', variant: 'muted' },
};

export default function AdminAttendance() {
  const dispatch = useAppDispatch();
  const employees = useAppSelector((state) => state.auth.employees).filter((e) => !e.isAdmin);
  const records = useAppSelector((state) => state.attendance.records);
  const [date, setDate] = useState(() => toDateKey(new Date()));

  const todayKey = toDateKey(new Date());

  // Employee list ek baar; us date ki attendance jab bhi date badle.
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAttendanceForDate(date));
  }, [dispatch, date]);

  const rows = useMemo(() => {
    return employees.map((employee) => {
      const record = records.find((r) => r.employeeId === employee.id && r.date === date);
      let status: DisplayStatus;
      if (record) {
        status = record.status;
      } else if (date === todayKey) {
        status = 'not-clocked-in';
      } else if (date > todayKey) {
        status = 'upcoming';
      } else {
        status = 'absent';
      }
      const hours =
        record?.clockIn && record?.clockOut ? formatDuration(minutesBetween(record.clockIn, record.clockOut)) : '—';
      return { employee, record, status, hours };
    });
  }, [employees, records, date, todayKey]);

  const summary = useMemo(() => {
    return {
      present: rows.filter((r) => r.status === 'present').length,
      absent: rows.filter((r) => r.status === 'absent').length,
      onLeave: rows.filter((r) => r.status === 'on-leave').length,
      total: employees.length,
    };
  }, [rows, employees.length]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Attendance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Company-wide attendance for {formatFullDate(date)}.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="text-xs font-semibold text-muted-foreground">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-xl border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <Users className="h-5 w-5 text-primary" />
            <p className="text-xl font-bold text-foreground">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-xl font-bold text-foreground">{summary.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-xl font-bold text-foreground">{summary.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <CalendarClock className="h-5 w-5 text-warning" />
            <p className="text-xl font-bold text-foreground">{summary.onLeave}</p>
            <p className="text-xs text-muted-foreground">On Leave</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No employees yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                <span>Employee</span>
                <span>Clock In</span>
                <span>Clock Out</span>
                <span>Hours</span>
                <span className="text-right">Status</span>
              </div>
              {rows.map(({ employee, record, status, hours }) => {
                const meta = STATUS_META[status];
                return (
                  <div
                    key={employee.id}
                    className="grid grid-cols-2 gap-3 px-5 py-4 text-sm sm:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] sm:items-center"
                  >
                    <span className="col-span-2 flex items-center gap-3 sm:col-span-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs" style={{ backgroundColor: employee.avatarColor }}>
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        <span className="block font-semibold text-foreground">{employee.name}</span>
                        <span className="block text-xs text-muted-foreground">{employee.role}</span>
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      <span className="mr-1 text-xs font-semibold uppercase text-muted-foreground/70 sm:hidden">In:</span>
                      {formatTime(record?.clockIn ?? null)}
                    </span>
                    <span className="text-muted-foreground">
                      <span className="mr-1 text-xs font-semibold uppercase text-muted-foreground/70 sm:hidden">Out:</span>
                      {formatTime(record?.clockOut ?? null)}
                    </span>
                    <span className="text-muted-foreground">{hours}</span>
                    <span className="sm:text-right">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
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
