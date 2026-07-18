import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LeaveRequest } from '@/types';
import * as apiModule from '@/api';
import { extractErrorMessage } from '@/api/client';

interface LeaveState {
  requests: LeaveRequest[]; // employee: apni | admin: sabki
  status: 'idle' | 'loading';
  error: string | null;
}

const initialState: LeaveState = {
  requests: [],
  status: 'idle',
  error: null,
};

// Employee: apni saari leave requests
export const fetchMyLeave = createAsyncThunk('leave/fetchMine', async () => {
  return apiModule.myLeave();
});

// Admin: saari leave requests
export const fetchAllLeave = createAsyncThunk('leave/fetchAll', async () => {
  return apiModule.allLeave();
});

export const createLeaveThunk = createAsyncThunk<
  LeaveRequest,
  { dates: string[]; reason: string },
  { rejectValue: string }
>('leave/create', async ({ dates, reason }, { rejectWithValue }) => {
  try {
    return await apiModule.createLeave(dates, reason);
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not send request.'));
  }
});

export const cancelLeaveThunk = createAsyncThunk('leave/cancel', async (id: string) => {
  await apiModule.cancelLeave(id);
  return id;
});

export const approveLeaveThunk = createAsyncThunk('leave/approve', async (id: string) => {
  return apiModule.approveLeave(id);
});

export const rejectLeaveThunk = createAsyncThunk('leave/reject', async (id: string) => {
  return apiModule.rejectLeave(id);
});

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const replaceOne = (state: LeaveState, updated: LeaveRequest) => {
      const idx = state.requests.findIndex((r) => r.id === updated.id);
      if (idx >= 0) state.requests[idx] = updated;
    };

    builder
      .addCase(fetchMyLeave.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyLeave.fulfilled, (state, action) => {
        state.status = 'idle';
        state.requests = action.payload;
      })
      .addCase(fetchAllLeave.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(createLeaveThunk.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      .addCase(cancelLeaveThunk.fulfilled, (state, action) => {
        state.requests = state.requests.filter((r) => r.id !== action.payload);
      })
      .addCase(approveLeaveThunk.fulfilled, (state, action) => {
        replaceOne(state, action.payload);
      })
      .addCase(rejectLeaveThunk.fulfilled, (state, action) => {
        replaceOne(state, action.payload);
      });
  },
});

export default leaveSlice.reducer;
