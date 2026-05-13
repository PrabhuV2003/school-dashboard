import axios from 'axios'

const BASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Axios instance — all Supabase calls use this
export const supabase = axios.create({
  baseURL: `${BASE_URL}/rest/v1`,
  headers: {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  },
})