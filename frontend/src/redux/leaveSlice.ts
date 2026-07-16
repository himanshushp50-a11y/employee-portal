import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LeaveRequest } from '@/types';

interface LeaveState {
  requests: LeaveRequest[];
}

const initialState: LeaveState = {
  requests: [],
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    addRequest: (
      state,
      action: PayloadAction<{ employeeId: string; dates: string[]; reason: string; createdAt: string }>
    ) => {
      state.requests.unshift({
        id: `leave-${Date.now()}`,
        employeeId: action.payload.employeeId,
        dates: action.payload.dates,
        reason: action.payload.reason,
        status: 'pending',
        createdAt: action.payload.createdAt,
      });
    },
    cancelRequest: (state, action: PayloadAction<{ id: string }>) => {
      state.requests = state.requests.filter((r) => r.id !== action.payload.id);
    },
    approveRequest: (state, action: PayloadAction<{ id: string }>) => {
      const request = state.requests.find((r) => r.id === action.payload.id);
      if (request) request.status = 'approved';
    },
    rejectRequest: (state, action: PayloadAction<{ id: string }>) => {
      const request = state.requests.find((r) => r.id === action.payload.id);
      if (request) request.status = 'rejected';
    },
  },
});

export const { addRequest, cancelRequest, approveRequest, rejectRequest } = leaveSlice.actions;
export default leaveSlice.reducer;
