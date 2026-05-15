import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAuthToken, clearAuthToken } from '../api/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) => {
        // Restore JWT on login
        setAuthToken(userData.access_token)
        set({
          user: userData,
          isAuthenticated: true,
        })
      },

      logout: () => {
        clearAuthToken()
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      // Called on app load to restore token from localStorage
      restoreToken: () => {
        const { user } = get()
        if (user?.access_token) {
          setAuthToken(user.access_token)
        }
      },
    }),
    {
      name: 'school-auth',
    }
  )
)