import { supabase } from './supabase'

export async function loginUser(email, password) {
  const response = await supabase.get('/users', {
    params: {
      email: `eq.${email}`,
      password: `eq.${password}`,
      select: 'id,name,email,role,class_assigned,phone',
    },
  })

  const users = response.data

  if (!users || users.length === 0) {
    throw new Error('Invalid email or password')
  }

  return users[0]
}