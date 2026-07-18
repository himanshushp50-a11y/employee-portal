import { useEffect, useMemo, useState } from 'react';
import { Sun, Moon, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clockInThunk, clockOutThunk, fetchMyAttendance } from '@/redux/attendanceSlice';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { showToast } from '@/utils/toast';
import { Card, CardContent } from '@/components/ui/card';
import {
  toDateKey,
  formatFullDate,
  formatTime,
  formatClock,
  formatDuration,
  minutesBetween,
} from '@/utils/utility';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const employee = useCurrentEmployee();
  const records = useAppSelector((state) => state.attendance.records);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Apni attendance history backend se laao (clock-in/out ka status aur month stats iske bina khaali honge)
  useEffect(() => {
    dispatch(fetchMyAttendance());
  }, [dispatch]);

  const today = toDateKey(now);

  const myRecords = useMemo(
    () => (employee ? records.filter((r) => r.employeeId === employee.id) : []),
    [records, employee]
  );

  const todayRecord = myRecords.find((r) => r.date === today) ?? null;
  const isClockedIn = Boolean(todayRecord?.clockIn && !todayRecord?.clockOut);
  const isDoneToday = Boolean(todayRecord?.clockIn && todayRecord?.clockOut);

  const lastCompleted = useMemo(() => {
    return [...myRecords]
      .filter((r) => r.clockOut)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  }, [myRecords]);

  const loggedMinutes = todayRecord?.clockIn
    ? minutesBetween(todayRecord.clockIn, todayRecord.clockOut ?? now.toISOString())
    : 0;

  const monthStats = useMemo(() => {
    const monthPrefix = today.slice(0, 7);
    const monthRecords = myRecords.filter((r) => r.date.startsWith(monthPrefix));
    return {
      present: monthRecords.filter((r) => r.status === 'present').length,
      absent: monthRecords.filter((r) => r.status === 'absent').length,
      onLeave: monthRecords.filter((r) => r.status === 'on-leave').length,
    };
  }, [myRecords, today]);

  if (!employee) return null;

  const handleClockIn = async () => {
    const result = await dispatch(clockInThunk());
    if (clockInThunk.rejected.match(result)) {
      showToast.error(result.payload ?? 'Could not clock in.');
    } else {
      showToast.success('Clocked in. Have a great shift!');
    }
  };

  const handleClockOut = async () => {
    const result = await dispatch(clockOutThunk());
    if (clockOutThunk.rejected.match(result)) {
      showToast.error(result.payload ?? 'Could not clock out.');
    } else {
      showToast.success('Clocked out. See you tomorrow!');
    }
  };

  let statusLine: string;
  if (isClockedIn && todayRecord?.clockIn) {
    statusLine = `Clocked In (Since ${formatTime(todayRecord.clockIn)})`;
  } else if (isDoneToday && todayRecord?.clockOut) {
    statusLine = `Logged Out (Today at ${formatTime(todayRecord.clockOut)})`;
  } else if (lastCompleted?.clockOut) {
    statusLine = `Logged Out (Last: ${formatTime(lastCompleted.clockOut)}, ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${lastCompleted.date}T00:00:00`))})`;
  } else {
    statusLine = 'Logged Out';
  }

  const helperText = isClockedIn
    ? "Tap 'CLOCK OUT' when your shift ends."
    : isDoneToday
      ? 'Your shift for today is complete.'
      : "Tap 'CLOCK IN' to start your shift.";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Welcome, {employee.name.split(' ')[0]}!</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{formatFullDate(today)}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:p-8">
          <p className="text-sm font-semibold text-muted-foreground">
            <span className={isClockedIn ? 'text-success' : 'text-foreground'}>*</span> {statusLine}
          </p>

          <div className="flex items-center gap-6 sm:gap-10">
            <button
              type="button"
              onClick={handleClockIn}
              disabled={isClockedIn || isDoneToday}
              className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full bg-success text-white shadow-card transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-32 sm:w-32"
            >
              <Sun className="h-7 w-7" />
              <span className="text-sm font-bold tracking-wide">CLOCK IN</span>
            </button>
            <button
              type="button"
              onClick={handleClockOut}
              disabled={!isClockedIn}
              className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full bg-primary text-white shadow-card transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-32 sm:w-32"
            >
              <Moon className="h-7 w-7" />
              <span className="text-sm font-bold tracking-wide">CLOCK OUT</span>
            </button>
          </div>

          <p className="font-mono text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
            {formatClock(now)}
          </p>
          <p className="text-sm text-muted-foreground">{helperText}</p>

          <div className="w-full border-t border-border pt-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Logged Today
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">{formatDuration(loggedMinutes)}</p>
          </div>

          <div className="w-full border-t border-border pt-5">
            <p className="mb-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Today's Work Log
            </p>
            {todayRecord?.clockIn ? (
              <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Session 1
                </span>
                <span className="text-muted-foreground">
                  {formatTime(todayRecord.clockIn)} — {formatTime(todayRecord.clockOut)}
                </span>
              </div>
            ) : (
              <p className="rounded-xl bg-secondary px-4 py-3 text-center text-sm text-muted-foreground">
                No entries yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-xl font-bold text-foreground">{monthStats.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-xl font-bold text-foreground">{monthStats.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <CalendarClock className="h-5 w-5 text-warning" />
            <p className="text-xl font-bold text-foreground">{monthStats.onLeave}</p>
            <p className="text-xs text-muted-foreground">On Leave</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
