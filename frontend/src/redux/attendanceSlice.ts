import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AttendanceRecord } from '@/types';
import * as apiModule from '@/api';
import { extractErrorMessage } from '@/api/client';

interface AttendanceState {
  records: AttendanceRecord[]; // employee view: apni history | admin view: ek date ki sabki
  status: 'idle' | 'loading';
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  status: 'idle',
  error: null,
};

// Ek record ko list me daalo ya (agar id same hai to) update kar do
function upsert(records: AttendanceRecord[], record: AttendanceRecord) {
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) records[idx] = record;
  else records.push(record);
}

// Apni poori attendance history (My Logs / Dashboard ke liye)
export const fetchMyAttendance = createAsyncThunk('attendance/fetchMine', async () => {
  return apiModule.myAttendance();
});

// Admin: ek particular date ki sabki attendance
export const fetchAttendanceForDate = createAsyncThunk(
  'attendance/fetchForDate',
  async (date: string) => {
    return apiModule.attendanceForDate(date);
  }
);

export const clockInThunk = createAsyncThunk<
  AttendanceRecord,
  void,
  { rejectValue: string }
>('attendance/clockIn', async (_, { rejectWithValue }) => {
  try {
    return await apiModule.clockIn();
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not clock in.'));
  }
});

export const clockOutThunk = createAsyncThunk<
  AttendanceRecord,
  void,
  { rejectValue: string }
>('attendance/clockOut', async (_, { rejectWithValue }) => {
  try {
    return await apiModule.clockOut();
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not clock out.'));
  }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAttendance.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.status = 'idle';
        state.records = action.payload;
      })
      .addCase(fetchAttendanceForDate.fulfilled, (state, action) => {
        state.records = action.payload;
      })
      .addCase(clockInThunk.fulfilled, (state, action) => {
        upsert(state.records, action.payload);
      })
      .addCase(clockOutThunk.fulfilled, (state, action) => {
        upsert(state.records, action.payload);
      });
  },
});

export default attendanceSlice.reducer;
