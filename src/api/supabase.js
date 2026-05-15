import axios from 'axios'

const BASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Base axios instance — uses anon key for public reads
export const supabase = axios.create({
  baseURL: `${BASE_URL}/rest/v1`,
  headers: {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  },
})

// Auth API — calls Supabase Auth endpoints directly
export const supabaseAuth = axios.create({
  baseURL: `${BASE_URL}/auth/v1`,
  headers: {
    apikey: ANON_KEY,
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request after login
export function setAuthToken(token) {
  supabase.defaults.headers.Authorization = `Bearer ${token}`
}

export function clearAuthToken() {
  supabase.defaults.headers.Authorization = `Bearer ${ANON_KEY}`
}