import axios from 'axios'
import { supabaseAuth, supabase, setAuthToken, clearAuthToken } from './supabase'

// Login with Supabase Auth
export async function loginUser(email, password) {
  const response = await supabaseAuth.post('/token?grant_type=password', {
    email,
    password,
  })

  const { access_token, user } = response.data

  // Attach JWT to all future requests
  setAuthToken(access_token)

  // Fetch profile (role, name, class_assigned)
  const profileRes = await supabase.get('/profiles', {
    params: {
      id: `eq.${user.id}`,
      select: 'id,name,email,role,class_assigned,phone',
    },
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  if (!profileRes.data || profileRes.data.length === 0) {
    throw new Error('Profile not found. Contact admin.')
  }

  return {
    ...profileRes.data[0],
    access_token,
  }
}

// Create a new teacher account (called from admin dashboard)
export async function createTeacherAccount({
  name,
  email,
  password,
  classAssigned,
  phone,
}) {
  // Step 1 — create auth user via Supabase Admin API
  const BASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY

  try {
    const response = await axios.post(
      `${BASE_URL}/auth/v1/admin/users`,
      {
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: 'teacher',
          class_assigned: classAssigned,
          phone,
        },
      },
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // Step 2 — create profile record in the database
    const profileRes = await axios.post(
      `${BASE_URL}/rest/v1/profiles`,
      {
        id: response.data.user.id,
        name,
        email,
        role: 'teacher',
        class_assigned: classAssigned,
        phone,
      },
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Create teacher error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.msg || error.message)
  }
}

export function logoutUser() {
  clearAuthToken()
}