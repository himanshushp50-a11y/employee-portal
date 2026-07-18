// Ek hi jagah se backend ko call karne ka setup.
// - baseURL: kaunsa backend (VITE_API_URL se aata hai, warna local dev fallback)
// - har request me login token (Bearer) apne aap lag jaata hai
// - error aane par ek saaf-suthra message nikaal ke deta hai

import axios, { AxiosError } from 'axios';

const TOKEN_KEY = 'kuberya-token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({
  // Vercel/production me VITE_API_URL set hota hai; local dev me backend localhost:8000 par.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Har request se pehle: agar token hai to "Authorization: Bearer <token>" header laga do.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend ki error (FastAPI usually { detail: "..." } bhejta hai) ko ek simple string me badalta hai.
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    // pydantic validation errors ek list hoti hai
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Please try again.';
  }
  return fallback;
}
