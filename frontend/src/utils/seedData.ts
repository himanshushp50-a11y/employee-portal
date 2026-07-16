import type { AttendanceRecord } from '@/types';
import { toDateKey } from '@/utils/utility';

export function generateDemoAttendance(employeeId: string, today: Date): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];

  for (let i = 1; i <= 20; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    const dateKey = toDateKey(date);
    const isAbsent = i === 5 || i === 13;

    if (isAbsent) {
      records.push({
        id: `att-${employeeId}-${dateKey}`,
        employeeId,
        date: dateKey,
        clockIn: null,
        clockOut: null,
        status: 'absent',
      });
      continue;
    }

    const inHour = 9;
    const inMinute = 0 + (i % 4) * 7;
    const outHour = 17;
    const outMinute = 30 + (i % 3) * 12;

    const clockIn = new Date(date);
    clockIn.setHours(inHour, inMinute, 0, 0);
    const clockOut = new Date(date);
    clockOut.setHours(outHour, outMinute, 0, 0);

    records.push({
      id: `att-${employeeId}-${dateKey}`,
      employeeId,
      date: dateKey,
      clockIn: clockIn.toISOString(),
      clockOut: clockOut.toISOString(),
      status: 'present',
    });
  }

  return records;
}
