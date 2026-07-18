export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string; // sirf local/demo ke liye; backend kabhi password wapas nahi bhejta
  role: string;
  avatarColor: string;
  isAdmin: boolean;
}

export interface Festival {
  date: string; // YYYY-MM-DD
  name: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'on-leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string | null; // ISO time string
  clockOut: string | null; // ISO time string
  status: AttendanceStatus;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  dates: string[]; // YYYY-MM-DD[]
  reason: string;
  status: LeaveStatus;
  createdAt: string; // ISO datetime
}
