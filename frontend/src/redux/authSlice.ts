import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Employee } from '@/types';

interface AuthState {
  employees: Employee[];
  currentUserId: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const AVATAR_COLORS = ['#7C3AED', '#2563EB', '#059669', '#DB2777', '#D97706', '#0891B2'];

// Seed accounts — also re-applied on app load (see ensureSeedAccounts) so that
// browsers with an older persisted auth state still pick up new seed accounts.
export const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Aniruddha Sharma',
    email: 'aniruddha@kuberya.ai',
    password: 'demo1234',
    role: 'Software Engineer',
    avatarColor: AVATAR_COLORS[0],
    isAdmin: false,
  },
  {
    id: 'admin-1',
    name: 'Kuberya Admin',
    email: 'admin@kuberya.ai',
    password: 'admin1234',
    role: 'Administrator',
    avatarColor: '#0F172A',
    isAdmin: true,
  },
];

const initialState: AuthState = {
  employees: SEED_EMPLOYEES,
  currentUserId: null,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        email: string;
        password: string;
        expectedRole: 'employee' | 'admin';
      }>
    ) => {
      const { email, password, expectedRole } = action.payload;
      const employee = state.employees.find(
        (e) => e.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!employee) {
        state.error = 'No account found with this email.';
        return;
      }
      if (employee.password !== password) {
        state.error = 'Incorrect password.';
        return;
      }
      const actualRole = employee.isAdmin ? 'admin' : 'employee';
      if (actualRole !== expectedRole) {
        state.error =
          actualRole === 'admin'
            ? 'This is an admin account. Switch to "Login as Admin" to continue.'
            : 'This is an employee account. Switch to "Login as Employee" to continue.';
        return;
      }
      state.currentUserId = employee.id;
      state.isAuthenticated = true;
      state.error = null;
    },
    signup: (
      state,
      action: PayloadAction<{ name: string; email: string; password: string; role: string }>
    ) => {
      const { name, email, password, role } = action.payload;
      const exists = state.employees.some(
        (e) => e.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (exists) {
        state.error = 'An account with this email already exists.';
        return;
      }
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role.trim() || 'Employee',
        avatarColor: AVATAR_COLORS[state.employees.length % AVATAR_COLORS.length],
        isAdmin: false,
      };
      state.employees.push(newEmployee);
      state.currentUserId = newEmployee.id;
      state.isAuthenticated = true;
      state.error = null;
    },
    logoutUser: (state) => {
      state.currentUserId = null;
      state.isAuthenticated = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateProfile: (
      state,
      action: PayloadAction<{ id: string; name: string; role: string }>
    ) => {
      const employee = state.employees.find((e) => e.id === action.payload.id);
      if (employee) {
        employee.name = action.payload.name;
        employee.role = action.payload.role;
      }
    },
    ensureSeedAccounts: (state) => {
      SEED_EMPLOYEES.forEach((seed) => {
        if (!state.employees.some((e) => e.id === seed.id)) {
          state.employees.push(seed);
        }
      });
    },
  },
});

export const { login, signup, logoutUser, clearAuthError, updateProfile, ensureSeedAccounts } =
  authSlice.actions;
export default authSlice.reducer;
