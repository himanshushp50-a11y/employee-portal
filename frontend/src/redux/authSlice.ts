import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Employee } from '@/types';
import * as apiModule from '@/api';
import { setToken, clearToken, getToken, extractErrorMessage } from '@/api/client';

interface AuthState {
  token: string | null;
  currentUser: Employee | null; // abhi logged-in user (employee ya admin)
  employees: Employee[]; // admin ke liye — saare non-admin employees ki list
  isAuthenticated: boolean;
  status: 'idle' | 'loading';
  error: string | null;
}

const initialState: AuthState = {
  token: getToken(),
  currentUser: null,
  employees: [],
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

type LoginArgs = { email: string; password: string; expectedRole: 'employee' | 'admin' };

// Login: backend ko email+password bhejo, token + employee wapas lo.
// "Login as Employee/Admin" toggle ke hisaab se role match bhi check karte hain.
export const loginThunk = createAsyncThunk<
  { token: string; employee: Employee },
  LoginArgs,
  { rejectValue: string }
>('auth/login', async ({ email, password, expectedRole }, { rejectWithValue }) => {
  try {
    const { token, employee } = await apiModule.login(email, password);
    const actualRole = employee.isAdmin ? 'admin' : 'employee';
    if (actualRole !== expectedRole) {
      return rejectWithValue(
        actualRole === 'admin'
          ? 'This is an admin account. Switch to "Login as Admin" to continue.'
          : 'This is an employee account. Switch to "Login as Employee" to continue.'
      );
    }
    setToken(token);
    return { token, employee };
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Incorrect email or password.'));
  }
});

export const signupThunk = createAsyncThunk<
  { token: string; employee: Employee },
  { name: string; email: string; password: string; role: string },
  { rejectValue: string }
>('auth/signup', async ({ name, email, password, role }, { rejectWithValue }) => {
  try {
    const { token, employee } = await apiModule.signup(name, email, password, role || 'Employee');
    setToken(token);
    return { token, employee };
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not create account.'));
  }
});

// App load hone par: agar token pehle se hai to "/me" call karke user wapas laao.
// Token invalid/expire ho gaya to chup-chaap logout kar do.
export const restoreSession = createAsyncThunk<Employee | null, void, { rejectValue: string }>(
  'auth/restore',
  async (_, { rejectWithValue }) => {
    if (!getToken()) return null;
    try {
      return await apiModule.getMe();
    } catch {
      clearToken();
      return rejectWithValue('session-expired');
    }
  }
);

// Admin: saare employees ki list laao
export const fetchEmployees = createAsyncThunk('auth/fetchEmployees', async () => {
  return apiModule.listEmployees();
});

// Apna profile (naam/designation) update karo
export const updateProfileThunk = createAsyncThunk<
  Employee,
  { name: string; role: string },
  { rejectValue: string }
>('auth/updateProfile', async ({ name, role }, { rejectWithValue }) => {
  try {
    return await apiModule.updateMyProfile(name, role);
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not update profile.'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      clearToken();
      state.token = null;
      state.currentUser = null;
      state.employees = [];
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const onAuthSuccess = (
      state: AuthState,
      action: PayloadAction<{ token: string; employee: Employee }>
    ) => {
      state.token = action.payload.token;
      state.currentUser = action.payload.employee;
      state.isAuthenticated = true;
      state.status = 'idle';
      state.error = null;
    };

    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, onAuthSuccess)
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Login failed.';
      })
      .addCase(signupThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, onAuthSuccess)
      .addCase(signupThunk.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Signup failed.';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentUser = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.token = null;
        state.currentUser = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
  },
});

export const { logoutUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
