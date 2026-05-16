import axios from 'axios'
import { supabaseAuth, supabase, setAuthToken, clearAuthToken } from './supabase'

// Login with Supabase Auth
export async function loginUser(email, password) {
  const response = await supabaseAuth.post('/token?grant_type=password', {
    email,
    password,
  })

  const { access_token, user } = response.data

  if (!access_token || !user) {
    throw new Error('Invalid login response from server')
  }

  setAuthToken(access_token)

  // Fetch profile with the JWT token
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
    throw new Error('Profile not found. Contact your admin.')
  }

  return {
    ...profileRes.data[0],
    access_token,
  }
}

// Helper — wait for trigger to create profile then return it
async function waitForProfile(userId, accessToken, retries = 5) {
  for (let i = 0; i < retries; i++) {
    const res = await supabase.get('/profiles', {
      params: {
        id: `eq.${userId}`,
        select: 'id,name,email,role,class_assigned,phone',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (res.data && res.data.length > 0) {
      return res.data[0]
    }

    // Wait 800ms before retrying
    await new Promise((resolve) => setTimeout(resolve, 800))
  }
  throw new Error('Profile creation timed out. Try again.')
}

// Create teacher account via Supabase Admin API
export async function createTeacherAccount({
  name,
  email,
  password,
  classAssigned,
  phone,
}) {
  const BASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY

  if (!SERVICE_KEY) {
    throw new Error('Service key not configured. Check your .env file.')
  }

  // Create the auth user
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

  const newUser = response.data

  if (!newUser || !newUser.id) {
    throw new Error('User creation failed — no user returned')
  }

  // Wait for the DB trigger to create the profile
  await waitForProfile(newUser.id, SERVICE_KEY)

  return newUser
}

export function logoutUser() {
  clearAuthToken()
}