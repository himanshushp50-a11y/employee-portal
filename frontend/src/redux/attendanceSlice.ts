import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AttendanceRecord } from '@/types';

interface AttendanceState {
  records: AttendanceRecord[];
  seeded: boolean;
}

const initialState: AttendanceState = {
  records: [],
  seeded: false,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    seedDemoRecords: (state, action: PayloadAction<AttendanceRecord[]>) => {
      if (state.seeded) return;
      state.records.push(...action.payload);
      state.seeded = true;
    },
    clockIn: (
      state,
      action: PayloadAction<{ employeeId: string; date: string; time: string }>
    ) => {
      const { employeeId, date, time } = action.payload;
      const existing = state.records.find(
        (r) => r.employeeId === employeeId && r.date === date
      );
      if (existing) {
        existing.clockIn = time;
        existing.status = 'present';
      } else {
        state.records.push({
          id: `att-${employeeId}-${date}`,
          employeeId,
          date,
          clockIn: time,
          clockOut: null,
          status: 'present',
        });
      }
    },
    clockOut: (
      state,
      action: PayloadAction<{ employeeId: string; date: string; time: string }>
    ) => {
      const { employeeId, date, time } = action.payload;
      const existing = state.records.find(
        (r) => r.employeeId === employeeId && r.date === date
      );
      if (existing) {
        existing.clockOut = time;
      }
    },
    markOnLeave: (
      state,
      action: PayloadAction<{ employeeId: string; dates: string[] }>
    ) => {
      const { employeeId, dates } = action.payload;
      dates.forEach((date) => {
        const existing = state.records.find(
          (r) => r.employeeId === employeeId && r.date === date
        );
        if (existing) {
          existing.status = 'on-leave';
        } else {
          state.records.push({
            id: `att-${employeeId}-${date}`,
            employeeId,
            date,
            clockIn: null,
            clockOut: null,
            status: 'on-leave',
          });
        }
      });
    },
  },
});

export const { seedDemoRecords, clockIn, clockOut, markOnLeave } = attendanceSlice.actions;
export default attendanceSlice.reducer;
