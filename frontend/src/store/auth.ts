import { create } from 'zustand'
import { api } from '../api/client'

interface User {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  balance: number
  is_premium: boolean
  premium_until?: string | null
}

interface AuthStore {
  user: User | null
  initData: string | null
  isAuthenticated: boolean
  isLoading: boolean
  initAuth: (initDataRaw: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  initData: null,
  isAuthenticated: false,
  isLoading: false,

  initAuth: async (initDataRaw: string) => {
    set({ isLoading: true, initData: initDataRaw })
    
    try {
      const response = await api.post('/auth/validate', {}, {
        headers: {
          'Authorization': `Bearer ${initDataRaw}`
        }
      })
      
      if (response.data.valid) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false
        })
      }
    } catch (error) {
      console.error('Auth error:', error)
      set({ isLoading: false })
    }
  },

  logout: () => {
    set({ user: null, initData: null, isAuthenticated: false })
  },

  refreshUser: async () => {
    const { initData } = get()
    if (!initData) return
    
    try {
      const response = await api.post('/auth/validate', {}, {
        headers: {
          'Authorization': `Bearer ${initData}`
        }
      })
      
      if (response.data.valid) {
        set({ user: response.data.user })
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }
}))