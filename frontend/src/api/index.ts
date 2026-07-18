// Saare backend calls yaha ek jagah. Har function backend ka snake_case + number-id
// data lekar frontend ke camelCase + string-id types (src/types) me badal deta hai.

import { api } from './client';
import type { Employee, AttendanceRecord, LeaveRequest, Festival } from '@/types';

// ── Backend response shapes (jaisa FastAPI bhejta hai) ──────────────────────
interface EmployeeDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_color: string;
  is_admin: boolean;
}
interface AttendanceDTO {
  id: number;
  employee_id: number;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: AttendanceRecord['status'];
}
interface LeaveDTO {
  id: number;
  employee_id: number;
  dates: string[];
  reason: string;
  status: LeaveRequest['status'];
  created_at: string;
}
interface FestivalDTO {
  id: number;
  date: string;
  name: string;
}
interface TokenDTO {
  access_token: string;
  token_type: string;
  employee: EmployeeDTO;
}

// ── Mappers (DTO -> frontend type) ──────────────────────────────────────────
const toEmployee = (e: EmployeeDTO): Employee => ({
  id: String(e.id),
  name: e.name,
  email: e.email,
  role: e.role,
  avatarColor: e.avatar_color,
  isAdmin: e.is_admin,
});
const toAttendance = (a: AttendanceDTO): AttendanceRecord => ({
  id: String(a.id),
  employeeId: String(a.employee_id),
  date: a.date,
  clockIn: a.clock_in,
  clockOut: a.clock_out,
  status: a.status,
});
const toLeave = (l: LeaveDTO): LeaveRequest => ({
  id: String(l.id),
  employeeId: String(l.employee_id),
  dates: l.dates,
  reason: l.reason,
  status: l.status,
  createdAt: l.created_at,
});
const toFestival = (f: FestivalDTO): Festival => ({ date: f.date, name: f.name });

// ── Auth ────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const { data } = await api.post<TokenDTO>('/api/auth/login', { email, password });
  return { token: data.access_token, employee: toEmployee(data.employee) };
}
export async function signup(name: string, email: string, password: string, role: string) {
  const { data } = await api.post<TokenDTO>('/api/auth/signup', { name, email, password, role });
  return { token: data.access_token, employee: toEmployee(data.employee) };
}
export async function getMe() {
  const { data } = await api.get<EmployeeDTO>('/api/auth/me');
  return toEmployee(data);
}

// ── Employees ────────────────────────────────────────────────────────────────
export async function listEmployees() {
  const { data } = await api.get<EmployeeDTO[]>('/api/employees');
  return data.map(toEmployee);
}
export async function updateMyProfile(name: string, role: string) {
  const { data } = await api.patch<EmployeeDTO>('/api/employees/me', { name, role });
  return toEmployee(data);
}

// ── Attendance ────────────────────────────────────────────────────────────────
export async function clockIn() {
  const { data } = await api.post<AttendanceDTO>('/api/attendance/clock-in');
  return toAttendance(data);
}
export async function clockOut() {
  const { data } = await api.post<AttendanceDTO>('/api/attendance/clock-out');
  return toAttendance(data);
}
export async function myAttendance(month?: string) {
  const { data } = await api.get<AttendanceDTO[]>('/api/attendance/me', {
    params: month ? { month } : undefined,
  });
  return data.map(toAttendance);
}
export async function attendanceForDate(date: string) {
  const { data } = await api.get<AttendanceDTO[]>('/api/attendance', {
    params: { for_date: date },
  });
  return data.map(toAttendance);
}

// ── Leave requests ────────────────────────────────────────────────────────────
export async function createLeave(dates: string[], reason: string) {
  const { data } = await api.post<LeaveDTO>('/api/leave-requests', { dates, reason });
  return toLeave(data);
}
export async function myLeave() {
  const { data } = await api.get<LeaveDTO[]>('/api/leave-requests/me');
  return data.map(toLeave);
}
export async function cancelLeave(id: string) {
  await api.delete(`/api/leave-requests/${id}`);
}
export async function allLeave() {
  const { data } = await api.get<LeaveDTO[]>('/api/leave-requests');
  return data.map(toLeave);
}
export async function approveLeave(id: string) {
  const { data } = await api.post<LeaveDTO>(`/api/leave-requests/${id}/approve`);
  return toLeave(data);
}
export async function rejectLeave(id: string) {
  const { data } = await api.post<LeaveDTO>(`/api/leave-requests/${id}/reject`);
  return toLeave(data);
}

// ── Festivals ──────────────────────────────────────────────────────────────────
export async function listFestivals() {
  const { data } = await api.get<FestivalDTO[]>('/api/festivals');
  return data.map(toFestival);
}
